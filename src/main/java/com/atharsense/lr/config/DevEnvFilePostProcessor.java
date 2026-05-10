package com.atharsense.lr.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Loads {@code .env.dev.local} from the project root when the {@code dev}
 * Spring profile is active.  Values already present in the environment
 * (e.g. set by IntelliJ run config or the OS) take priority and are never
 * overwritten.
 */
public class DevEnvFilePostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DevEnvFilePostProcessor.class);
    private static final String ENV_FILE = ".env.dev.local";
    private static final String SOURCE_NAME = "devEnvFile";

    @Override
    public int getOrder() {
        // Run early so downstream processors (e.g. YAML loaders) can reference
        // property placeholders that come from this file.
        return Ordered.LOWEST_PRECEDENCE - 10;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        boolean isDev = false;
        for (String profile : environment.getActiveProfiles()) {
            if ("dev".equals(profile)) {
                isDev = true;
                break;
            }
        }
        if (!isDev) {
            return;
        }

        Path envPath = resolveEnvFile();
        if (envPath == null || !Files.exists(envPath)) {
            log.debug("DevEnvFilePostProcessor: {} not found, skipping", ENV_FILE);
            return;
        }

        Map<String, Object> props = parse(envPath);
        if (props.isEmpty()) {
            return;
        }

        // Add as the LOWEST priority source so real env vars always win.
        environment.getPropertySources().addLast(new MapPropertySource(SOURCE_NAME, props));
        log.info("DevEnvFilePostProcessor: loaded {} properties from {}", props.size(), envPath.toAbsolutePath());
    }

    private Path resolveEnvFile() {
        // 1) current working directory (typical when running via Maven / IntelliJ)
        Path p = Path.of(ENV_FILE);
        if (Files.exists(p)) return p;

        // 2) one level up (in case the working dir is a sub-module)
        p = Path.of("..", ENV_FILE);
        if (Files.exists(p)) return p;

        return null;
    }

    private Map<String, Object> parse(Path path) {
        Map<String, Object> map = new LinkedHashMap<>();
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.strip();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int idx = line.indexOf('=');
                if (idx < 1) continue;
                String key = line.substring(0, idx).strip();
                String value = line.substring(idx + 1);
                // Strip wrapping quotes
                if (value.length() >= 2) {
                    char first = value.charAt(0);
                    char last = value.charAt(value.length() - 1);
                    if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                        value = value.substring(1, value.length() - 1);
                    }
                }
                map.put(key, value);
            }
        } catch (IOException e) {
            log.warn("DevEnvFilePostProcessor: could not read {}: {}", path, e.getMessage());
        }
        return map;
    }
}

