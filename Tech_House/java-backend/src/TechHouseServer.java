import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class TechHouseServer {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter RESET_LOG_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static void main(String[] args) throws Exception {
        AppConfig config = AppConfig.fromEnv();
        DataStore store = new DataStore(config.baseDir());
        store.ensureStorage();

        HttpServer server = HttpServer.create(new InetSocketAddress(config.port()), 0);
        ApiHandler apiHandler = new ApiHandler(config, store);
        server.createContext("/api/products", apiHandler::handleProducts);
        server.createContext("/api/orders", apiHandler::handleOrders);
        server.createContext("/api/register", apiHandler::handleRegister);
        server.createContext("/api/login", apiHandler::handleLogin);
        server.createContext("/api/logout", apiHandler::handleLogout);
        server.createContext("/api/forgot-password", apiHandler::handleForgotPassword);
        server.createContext("/api/reset-password", apiHandler::handleResetPassword);
        server.createContext("/webhook/product", apiHandler::handleWebhookProduct);
        server.createContext("/", new StaticFileHandler(config.baseDir()));
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        System.out.println("Tech House Java server running on http://localhost:" + config.port());
        System.out.println("Serving frontend from " + config.baseDir());
        new CountDownLatch(1).await();
    }

    record AppConfig(int port, String webhookSecret, Path baseDir) {
        static AppConfig fromEnv() {
            String portValue = System.getenv().getOrDefault("PORT", "3000");
            int port = Integer.parseInt(portValue);
            String webhookSecret = System.getenv().getOrDefault("WEBHOOK_SECRET", "");
            Path baseDir = Path.of(".").toAbsolutePath().normalize();
            return new AppConfig(port, webhookSecret, baseDir);
        }
    }

    static final class ApiHandler {
        private final AppConfig config;
        private final DataStore store;

        ApiHandler(AppConfig config, DataStore store) {
            this.config = config;
            this.store = store;
        }

        void handleProducts(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                sendJson(exchange, 200, Json.stringify(store.readProducts()));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleOrders(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod().toUpperCase(Locale.ROOT);
            try {
                if ("GET".equals(method)) {
                    sendJson(exchange, 200, Json.stringify(store.readOrders()));
                    return;
                }
                if ("DELETE".equals(method)) {
                    store.writeOrders(new ArrayList<>());
                    sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
                    return;
                }
                if (!"POST".equals(method)) {
                    sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                    return;
                }

                Map<String, Object> body = requireObject(readJsonBody(exchange));
                String orderId = requireString(body.get("id"));
                Map<String, Object> customer = requireObject(body.get("customer"));
                List<Object> items = requireArray(body.get("items"));
                String date = requireString(body.get("date"));
                if (items.isEmpty()) {
                    sendJson(exchange, 400, Json.stringify(Map.of("error", "empty_order")));
                    return;
                }

                List<Map<String, Object>> products = store.readProducts();
                Map<String, Map<String, Object>> byId = new LinkedHashMap<>();
                for (Map<String, Object> product : products) {
                    byId.put(String.valueOf(asInt(product.get("id"))), product);
                }

                double calculatedTotal = 0;
                List<Map<String, Object>> validItems = new ArrayList<>();
                for (Object itemObj : items) {
                    Map<String, Object> item = requireObject(itemObj);
                    int productId = asInt(item.get("id"));
                    int qty = asInt(item.get("qty"));
                    if (qty <= 0) {
                        sendJson(exchange, 400, Json.stringify(Map.of("error", "invalid_qty")));
                        return;
                    }
                    Map<String, Object> product = byId.get(String.valueOf(productId));
                    if (product == null) {
                        sendJson(exchange, 400, Json.stringify(Map.of("error", "Product unavailable: " + productId)));
                        return;
                    }
                    double price = asDouble(product.get("price"));
                    calculatedTotal += price * qty;
                    Map<String, Object> valid = new LinkedHashMap<>();
                    valid.put("id", productId);
                    valid.put("title", requireString(product.get("title")));
                    valid.put("price", price);
                    valid.put("qty", qty);
                    validItems.add(valid);
                }

                Map<String, Object> normalizedOrder = new LinkedHashMap<>();
                normalizedOrder.put("id", orderId);
                normalizedOrder.put("customer", Map.of(
                    "name", requireString(customer.get("name")),
                    "email", requireString(customer.get("email")),
                    "address", requireString(customer.get("address"))
                ));
                normalizedOrder.put("items", validItems);
                normalizedOrder.put("total", roundMoney(calculatedTotal));
                normalizedOrder.put("date", date);

                List<Map<String, Object>> orders = store.readOrders();
                orders.removeIf(existing -> Objects.equals(String.valueOf(existing.get("id")), orderId));
                orders.add(0, normalizedOrder);
                store.writeOrders(orders);

                sendJson(exchange, 200, Json.stringify(Map.of("ok", true, "id", orderId)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleRegister(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                Map<String, Object> body = requireObject(readJsonBody(exchange));
                String name = requireString(body.get("name"));
                String email = normalizeEmail(requireString(body.get("email")));
                String password = requireString(body.get("password"));
                if (password.length() < 6) {
                    throw new BadRequestException("password_too_short");
                }

                List<Map<String, Object>> users = store.readUsers();
                for (Map<String, Object> user : users) {
                    if (email.equals(normalizeEmail(requireString(user.get("email"))))) {
                        sendJson(exchange, 400, Json.stringify(Map.of("error", "user_exists")));
                        return;
                    }
                }

                int nextId = 1;
                for (Map<String, Object> user : users) {
                    nextId = Math.max(nextId, asInt(user.get("id")) + 1);
                }

                byte[] salt = randomBytes(16);
                String passwordHash = hashPassword(password, salt);
                Map<String, Object> user = new LinkedHashMap<>();
                user.put("id", nextId);
                user.put("name", name);
                user.put("email", email);
                user.put("passwordHash", passwordHash);
                user.put("salt", Base64.getEncoder().encodeToString(salt));
                user.put("createdAt", Instant.now().toString());
                users.add(user);
                store.writeUsers(users);

                sendJson(exchange, 200, Json.stringify(Map.of("ok", true, "id", nextId)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleLogin(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                Map<String, Object> body = requireObject(readJsonBody(exchange));
                String email = normalizeEmail(requireString(body.get("email")));
                String password = requireString(body.get("password"));

                List<Map<String, Object>> users = store.readUsers();
                Map<String, Object> matchedUser = null;
                for (Map<String, Object> user : users) {
                    if (email.equals(normalizeEmail(requireString(user.get("email"))))) {
                        matchedUser = user;
                        break;
                    }
                }
                if (matchedUser == null) {
                    sendJson(exchange, 401, Json.stringify(Map.of("error", "wrong_credentials")));
                    return;
                }

                byte[] salt = Base64.getDecoder().decode(requireString(matchedUser.get("salt")));
                String actualHash = requireString(matchedUser.get("passwordHash"));
                String expectedHash = hashPassword(password, salt);
                if (!Objects.equals(actualHash, expectedHash)) {
                    sendJson(exchange, 401, Json.stringify(Map.of("error", "wrong_credentials")));
                    return;
                }

                List<Map<String, Object>> sessions = store.readSessions();
                String token = bytesToHex(randomBytes(32));
                Map<String, Object> session = new LinkedHashMap<>();
                session.put("token", token);
                session.put("userId", asInt(matchedUser.get("id")));
                session.put("createdAt", Instant.now().toString());
                sessions.add(session);
                store.writeSessions(sessions);

                Map<String, Object> user = new LinkedHashMap<>();
                user.put("id", asInt(matchedUser.get("id")));
                user.put("name", requireString(matchedUser.get("name")));
                user.put("email", requireString(matchedUser.get("email")));
                sendJson(exchange, 200, Json.stringify(Map.of("ok", true, "token", token, "user", user)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleLogout(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
                if (authHeader == null || authHeader.isBlank()) {
                    sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
                    return;
                }
                String[] parts = authHeader.split(" ", 2);
                String token = parts.length == 2 ? parts[1].trim() : "";
                if (token.isBlank()) {
                    sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
                    return;
                }

                List<Map<String, Object>> sessions = store.readSessions();
                sessions.removeIf(session -> token.equals(String.valueOf(session.get("token"))));
                store.writeSessions(sessions);
                sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleForgotPassword(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                Map<String, Object> body = requireObject(readJsonBody(exchange));
                String email = normalizeEmail(requireString(body.get("email")));

                List<Map<String, Object>> users = store.readUsers();
                boolean exists = users.stream()
                    .anyMatch(user -> email.equals(normalizeEmail(requireString(user.get("email")))));
                if (!exists) {
                    sendJson(exchange, 404, Json.stringify(Map.of("error", "user_not_found")));
                    return;
                }

                String token = String.format("%06d", RANDOM.nextInt(1_000_000));
                long expiresAt = System.currentTimeMillis() + 15 * 60 * 1000L;

                List<Map<String, Object>> resets = store.readPasswordResets();
                resets.removeIf(reset -> email.equals(normalizeEmail(requireString(reset.get("email")))));
                resets.add(Map.of(
                    "email", email,
                    "token", token,
                    "expiresAt", expiresAt
                ));
                store.writePasswordResets(resets);

                String stamp = LocalDateTime.now().format(RESET_LOG_TIME);
                System.out.println("[" + stamp + "] Password reset code for " + email + ": " + token);
                sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleResetPassword(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                Map<String, Object> body = requireObject(readJsonBody(exchange));
                String email = normalizeEmail(requireString(body.get("email")));
                String token = requireString(body.get("token"));
                String newPassword = requireString(body.get("newPassword"));
                if (newPassword.length() < 6) {
                    throw new BadRequestException("password_too_short");
                }

                List<Map<String, Object>> resets = store.readPasswordResets();
                Map<String, Object> matched = null;
                for (Map<String, Object> reset : resets) {
                    if (email.equals(normalizeEmail(requireString(reset.get("email"))))
                        && token.equals(requireString(reset.get("token")))) {
                        matched = reset;
                        break;
                    }
                }
                if (matched == null || asLong(matched.get("expiresAt")) < System.currentTimeMillis()) {
                    sendJson(exchange, 400, Json.stringify(Map.of("error", "invalid_token")));
                    return;
                }

                List<Map<String, Object>> users = store.readUsers();
                boolean updated = false;
                for (Map<String, Object> user : users) {
                    if (email.equals(normalizeEmail(requireString(user.get("email"))))) {
                        byte[] salt = randomBytes(16);
                        user.put("salt", Base64.getEncoder().encodeToString(salt));
                        user.put("passwordHash", hashPassword(newPassword, salt));
                        updated = true;
                        break;
                    }
                }
                if (!updated) {
                    sendJson(exchange, 404, Json.stringify(Map.of("error", "user_not_found")));
                    return;
                }

                resets.removeIf(reset -> email.equals(normalizeEmail(requireString(reset.get("email")))));
                store.writeUsers(users);
                store.writePasswordResets(resets);
                sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }

        void handleWebhookProduct(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, Json.stringify(Map.of("error", "method_not_allowed")));
                return;
            }
            try {
                if (!config.webhookSecret().isBlank()) {
                    String secret = exchange.getRequestHeaders().getFirst("x-webhook-secret");
                    if (!config.webhookSecret().equals(secret)) {
                        sendText(exchange, 401, "invalid secret", "text/plain; charset=utf-8");
                        return;
                    }
                }

                Map<String, Object> body = requireObject(readJsonBody(exchange));
                int id = asInt(body.get("id"));
                if (id <= 0) {
                    throw new BadRequestException("invalid payload");
                }

                Map<String, Object> normalized = new LinkedHashMap<>();
                normalized.put("id", id);
                normalized.put("title", requireString(body.get("title")));
                normalized.put("price", roundMoney(asDouble(body.get("price"))));
                normalized.put("category", requireString(body.get("category")));
                Object desc = body.get("desc") != null ? body.get("desc") : body.get("description");
                normalized.put("desc", requireString(desc));
                normalized.put("img", requireString(body.get("img")));

                List<Map<String, Object>> products = store.readProducts();
                boolean updated = false;
                for (int i = 0; i < products.size(); i++) {
                    if (asInt(products.get(i).get("id")) == id) {
                        products.set(i, normalized);
                        updated = true;
                        break;
                    }
                }
                if (!updated) {
                    products.add(normalized);
                }
                store.writeProducts(products);
                sendJson(exchange, 200, Json.stringify(Map.of("ok", true)));
            } catch (BadRequestException ex) {
                sendJson(exchange, 400, Json.stringify(Map.of("error", ex.getMessage())));
            } catch (Exception ex) {
                ex.printStackTrace();
                sendJson(exchange, 500, Json.stringify(Map.of("error", "failed")));
            }
        }
    }

    static final class StaticFileHandler implements HttpHandler {
        private final Path root;

        StaticFileHandler(Path root) {
            this.root = root;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String method = exchange.getRequestMethod().toUpperCase(Locale.ROOT);
            if (!"GET".equals(method) && !"HEAD".equals(method)) {
                sendText(exchange, 405, "Method Not Allowed", "text/plain; charset=utf-8");
                return;
            }

            String rawPath = exchange.getRequestURI().getPath();
            String relative = "/".equals(rawPath) ? "index.html" : rawPath.substring(1);
            Path file = root.resolve(relative).normalize();
            if (!file.startsWith(root) || Files.isDirectory(file) || !Files.exists(file)) {
                sendText(exchange, 404, "Not Found", "text/plain; charset=utf-8");
                return;
            }

            byte[] bytes = Files.readAllBytes(file);
            String mimeType = URLConnection.guessContentTypeFromName(file.getFileName().toString());
            if (mimeType == null) {
                mimeType = "application/octet-stream";
            }

            Headers headers = exchange.getResponseHeaders();
            headers.set("Content-Type", mimeType);
            headers.set("Cache-Control", "no-cache");
            if ("HEAD".equals(method)) {
                exchange.sendResponseHeaders(200, -1);
                exchange.close();
                return;
            }

            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    static final class DataStore {
        private final Path root;
        private final Path dataDir;
        private final Path usersFile;
        private final Path sessionsFile;
        private final Path ordersFile;
        private final Path passwordResetsFile;
        private final Path productsFile;

        DataStore(Path root) {
            this.root = root;
            this.dataDir = root.resolve("java-backend").resolve("data");
            this.usersFile = dataDir.resolve("users.json");
            this.sessionsFile = dataDir.resolve("sessions.json");
            this.ordersFile = dataDir.resolve("orders.json");
            this.passwordResetsFile = dataDir.resolve("password_resets.json");
            this.productsFile = root.resolve("products.json");
        }

        synchronized void ensureStorage() throws IOException {
            Files.createDirectories(dataDir);
            ensureArrayFile(usersFile);
            ensureArrayFile(sessionsFile);
            ensureArrayFile(ordersFile);
            ensureArrayFile(passwordResetsFile);
        }

        private void ensureArrayFile(Path file) throws IOException {
            if (!Files.exists(file)) {
                Files.writeString(file, "[]\n", StandardCharsets.UTF_8);
            }
        }

        synchronized List<Map<String, Object>> readProducts() throws IOException {
            return readArrayOfObjects(productsFile);
        }

        synchronized void writeProducts(List<Map<String, Object>> products) throws IOException {
            writeJson(productsFile, Json.stringify(products));
        }

        synchronized List<Map<String, Object>> readUsers() throws IOException {
            return readArrayOfObjects(usersFile);
        }

        synchronized void writeUsers(List<Map<String, Object>> users) throws IOException {
            writeJson(usersFile, Json.stringify(users));
        }

        synchronized List<Map<String, Object>> readSessions() throws IOException {
            return readArrayOfObjects(sessionsFile);
        }

        synchronized void writeSessions(List<Map<String, Object>> sessions) throws IOException {
            writeJson(sessionsFile, Json.stringify(sessions));
        }

        synchronized List<Map<String, Object>> readOrders() throws IOException {
            return readArrayOfObjects(ordersFile);
        }

        synchronized void writeOrders(List<Map<String, Object>> orders) throws IOException {
            writeJson(ordersFile, Json.stringify(orders));
        }

        synchronized List<Map<String, Object>> readPasswordResets() throws IOException {
            return readArrayOfObjects(passwordResetsFile);
        }

        synchronized void writePasswordResets(List<Map<String, Object>> resets) throws IOException {
            writeJson(passwordResetsFile, Json.stringify(resets));
        }

        private List<Map<String, Object>> readArrayOfObjects(Path file) throws IOException {
            String content = Files.readString(file, StandardCharsets.UTF_8);
            Object parsed = Json.parse(content);
            List<Object> list = requireArray(parsed);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Object item : list) {
                result.add(requireObject(item));
            }
            return result;
        }

        private void writeJson(Path file, String json) throws IOException {
            Files.writeString(file, json + "\n", StandardCharsets.UTF_8);
        }
    }

    static final class Json {
        static Object parse(String text) {
            return new Parser(text).parseValue();
        }

        static String stringify(Object value) {
            StringBuilder builder = new StringBuilder();
            writeJson(value, builder);
            return builder.toString();
        }

        private static void writeJson(Object value, StringBuilder builder) {
            if (value == null) {
                builder.append("null");
                return;
            }
            if (value instanceof String s) {
                builder.append('"').append(escape(s)).append('"');
                return;
            }
            if (value instanceof Number || value instanceof Boolean) {
                builder.append(value);
                return;
            }
            if (value instanceof Map<?, ?> map) {
                builder.append('{');
                boolean first = true;
                for (Map.Entry<?, ?> entry : map.entrySet()) {
                    if (!first) {
                        builder.append(',');
                    }
                    first = false;
                    builder.append('"').append(escape(String.valueOf(entry.getKey()))).append('"').append(':');
                    writeJson(entry.getValue(), builder);
                }
                builder.append('}');
                return;
            }
            if (value instanceof List<?> list) {
                builder.append('[');
                boolean first = true;
                for (Object item : list) {
                    if (!first) {
                        builder.append(',');
                    }
                    first = false;
                    writeJson(item, builder);
                }
                builder.append(']');
                return;
            }
            builder.append('"').append(escape(String.valueOf(value))).append('"');
        }

        private static String escape(String value) {
            StringBuilder out = new StringBuilder();
            for (int i = 0; i < value.length(); i++) {
                char ch = value.charAt(i);
                switch (ch) {
                    case '"' -> out.append("\\\"");
                    case '\\' -> out.append("\\\\");
                    case '\b' -> out.append("\\b");
                    case '\f' -> out.append("\\f");
                    case '\n' -> out.append("\\n");
                    case '\r' -> out.append("\\r");
                    case '\t' -> out.append("\\t");
                    default -> {
                        if (ch < 32) {
                            out.append(String.format("\\u%04x", (int) ch));
                        } else {
                            out.append(ch);
                        }
                    }
                }
            }
            return out.toString();
        }

        static final class Parser {
            private final String text;
            private int index;

            Parser(String text) {
                this.text = text == null ? "" : text;
            }

            Object parseValue() {
                skipWhitespace();
                if (index >= text.length()) {
                    throw new BadRequestException("invalid_json");
                }
                char ch = text.charAt(index);
                return switch (ch) {
                    case '{' -> parseObject();
                    case '[' -> parseArray();
                    case '"' -> parseString();
                    case 't' -> parseLiteral("true", Boolean.TRUE);
                    case 'f' -> parseLiteral("false", Boolean.FALSE);
                    case 'n' -> parseLiteral("null", null);
                    default -> {
                        if (ch == '-' || Character.isDigit(ch)) {
                            yield parseNumber();
                        }
                        throw new BadRequestException("invalid_json");
                    }
                };
            }

            private Map<String, Object> parseObject() {
                Map<String, Object> object = new LinkedHashMap<>();
                expect('{');
                skipWhitespace();
                if (peek('}')) {
                    index++;
                    return object;
                }
                while (true) {
                    skipWhitespace();
                    String key = parseString();
                    skipWhitespace();
                    expect(':');
                    Object value = parseValue();
                    object.put(key, value);
                    skipWhitespace();
                    if (peek('}')) {
                        index++;
                        return object;
                    }
                    expect(',');
                }
            }

            private List<Object> parseArray() {
                List<Object> array = new ArrayList<>();
                expect('[');
                skipWhitespace();
                if (peek(']')) {
                    index++;
                    return array;
                }
                while (true) {
                    array.add(parseValue());
                    skipWhitespace();
                    if (peek(']')) {
                        index++;
                        return array;
                    }
                    expect(',');
                }
            }

            private String parseString() {
                expect('"');
                StringBuilder builder = new StringBuilder();
                while (index < text.length()) {
                    char ch = text.charAt(index++);
                    if (ch == '"') {
                        return builder.toString();
                    }
                    if (ch == '\\') {
                        if (index >= text.length()) {
                            throw new BadRequestException("invalid_json");
                        }
                        char escaped = text.charAt(index++);
                        switch (escaped) {
                            case '"', '\\', '/' -> builder.append(escaped);
                            case 'b' -> builder.append('\b');
                            case 'f' -> builder.append('\f');
                            case 'n' -> builder.append('\n');
                            case 'r' -> builder.append('\r');
                            case 't' -> builder.append('\t');
                            case 'u' -> {
                                if (index + 4 > text.length()) {
                                    throw new BadRequestException("invalid_json");
                                }
                                String hex = text.substring(index, index + 4);
                                builder.append((char) Integer.parseInt(hex, 16));
                                index += 4;
                            }
                            default -> throw new BadRequestException("invalid_json");
                        }
                    } else {
                        builder.append(ch);
                    }
                }
                throw new BadRequestException("invalid_json");
            }

            private Object parseNumber() {
                int start = index;
                if (peek('-')) {
                    index++;
                }
                while (index < text.length() && Character.isDigit(text.charAt(index))) {
                    index++;
                }
                boolean fractional = false;
                if (peek('.')) {
                    fractional = true;
                    index++;
                    while (index < text.length() && Character.isDigit(text.charAt(index))) {
                        index++;
                    }
                }
                if (peek('e') || peek('E')) {
                    fractional = true;
                    index++;
                    if (peek('+') || peek('-')) {
                        index++;
                    }
                    while (index < text.length() && Character.isDigit(text.charAt(index))) {
                        index++;
                    }
                }
                String token = text.substring(start, index);
                return fractional ? Double.parseDouble(token) : Long.parseLong(token);
            }

            private Object parseLiteral(String literal, Object value) {
                if (!text.startsWith(literal, index)) {
                    throw new BadRequestException("invalid_json");
                }
                index += literal.length();
                return value;
            }

            private void expect(char expected) {
                skipWhitespace();
                if (index >= text.length() || text.charAt(index) != expected) {
                    throw new BadRequestException("invalid_json");
                }
                index++;
            }

            private boolean peek(char expected) {
                return index < text.length() && text.charAt(index) == expected;
            }

            private void skipWhitespace() {
                while (index < text.length() && Character.isWhitespace(text.charAt(index))) {
                    index++;
                }
            }
        }
    }

    static final class BadRequestException extends RuntimeException {
        BadRequestException(String message) {
            super(message);
        }
    }

    private static Object readJsonBody(HttpExchange exchange) throws IOException {
        try (InputStream inputStream = exchange.getRequestBody()) {
            String body = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            if (body.isBlank()) {
                throw new BadRequestException("invalid");
            }
            return Json.parse(body);
        }
    }

    private static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        sendText(exchange, status, json, "application/json; charset=utf-8");
    }

    private static void sendText(HttpExchange exchange, int status, String body, String contentType) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        Headers headers = exchange.getResponseHeaders();
        headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-webhook-secret");
        headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Map<String, Object> requireObject(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            Map<String, Object> map = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                map.put(String.valueOf(entry.getKey()), entry.getValue());
            }
            return map;
        }
        throw new BadRequestException("invalid");
    }

    private static List<Object> requireArray(Object value) {
        if (value instanceof List<?> list) {
            return new ArrayList<>(list);
        }
        throw new BadRequestException("invalid");
    }

    private static String requireString(Object value) {
        if (value == null) {
            throw new BadRequestException("invalid");
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            throw new BadRequestException("invalid");
        }
        return text;
    }

    private static int asInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(requireString(value));
    }

    private static long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(requireString(value));
    }

    private static double asDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(requireString(value));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static byte[] randomBytes(int size) {
        byte[] bytes = new byte[size];
        RANDOM.nextBytes(bytes);
        return bytes;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder();
        for (byte b : bytes) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }

    private static String hashPassword(String password, byte[] salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 100_000, 256);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException("Unable to hash password", ex);
        }
    }

    private static double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
