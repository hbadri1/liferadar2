package com.atharsense.lr.integrations.mapbox;

import com.atharsense.lr.config.ApplicationProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class MapboxGeocodingClient {

    private final ApplicationProperties applicationProperties;

    private final RestClient restClient;

    public MapboxGeocodingClient(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
        this.restClient = RestClient.builder().build();
    }

    public boolean isEnabled() {
        return applicationProperties.getMapbox().isEnabled() && StringUtils.hasText(applicationProperties.getMapbox().getAccessToken());
    }

    public String getStyleUrl() {
        return applicationProperties.getMapbox().getStyleUrl();
    }

    public String getAccessToken() {
        return applicationProperties.getMapbox().getAccessToken();
    }

    public List<MapboxPlace> forwardGeocode(String query, Integer limit) {
        if (!isEnabled() || !StringUtils.hasText(query)) {
            return List.of();
        }

        int resolvedLimit = resolveLimit(limit);
        JsonNode body = restClient
            .get()
            .uri(uriBuilder ->
                uriBuilder
                    .scheme("https")
                    .host(extractHost(applicationProperties.getMapbox().getApiBaseUrl()))
                    .path("/geocoding/v5/mapbox.places/{query}.json")
                    .queryParam("access_token", applicationProperties.getMapbox().getAccessToken())
                    .queryParam("limit", resolvedLimit)
                    .queryParam("types", "place,locality,address,poi")
                    .build(query)
            )
            .retrieve()
            .body(JsonNode.class);

        return extractPlaces(body);
    }

    public MapboxPlace reverseGeocode(Double longitude, Double latitude) {
        if (!isEnabled() || longitude == null || latitude == null) {
            return null;
        }

        JsonNode body = restClient
            .get()
            .uri(uriBuilder ->
                uriBuilder
                    .scheme("https")
                    .host(extractHost(applicationProperties.getMapbox().getApiBaseUrl()))
                    .path("/geocoding/v5/mapbox.places/{longitude},{latitude}.json")
                    .queryParam("access_token", applicationProperties.getMapbox().getAccessToken())
                    .queryParam("limit", 1)
                    .build(longitude, latitude)
            )
            .retrieve()
            .body(JsonNode.class);

        List<MapboxPlace> places = extractPlaces(body);
        return places.isEmpty() ? null : places.get(0);
    }

    private int resolveLimit(Integer requestedLimit) {
        int defaultLimit = applicationProperties.getMapbox().getGeocodingLimit() == null ? 5 : applicationProperties.getMapbox().getGeocodingLimit();
        int limit = requestedLimit == null ? defaultLimit : requestedLimit;
        return Math.min(Math.max(limit, 1), 10);
    }

    private String extractHost(String apiBaseUrl) {
        if (!StringUtils.hasText(apiBaseUrl)) {
            return "api.mapbox.com";
        }

        String normalized = apiBaseUrl
            .replace("https://", "")
            .replace("http://", "")
            .replaceAll("/+$", "");
        return normalized.isBlank() ? "api.mapbox.com" : normalized;
    }

    private List<MapboxPlace> extractPlaces(JsonNode body) {
        if (body == null || !body.has("features") || !body.get("features").isArray()) {
            return List.of();
        }

        List<MapboxPlace> places = new ArrayList<>();
        for (JsonNode feature : body.get("features")) {
            JsonNode center = feature.get("center");
            if (center == null || !center.isArray() || center.size() < 2) {
                continue;
            }

            double longitude = center.get(0).asDouble();
            double latitude = center.get(1).asDouble();
            String id = feature.path("id").asText();
            String name = feature.path("place_name").asText();
            places.add(new MapboxPlace(id, name, latitude, longitude));
        }

        return places;
    }
}

