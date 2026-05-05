package com.atharsense.lr.web.rest;

import com.atharsense.lr.integrations.mapbox.MapboxGeocodingClient;
import com.atharsense.lr.integrations.mapbox.MapboxPlace;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/integrations/mapbox")
@PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_FAMILY_ADMIN','ROLE_ADMIN')")
public class MapboxIntegrationResource {

    private final MapboxGeocodingClient mapboxGeocodingClient;

    public MapboxIntegrationResource(MapboxGeocodingClient mapboxGeocodingClient) {
        this.mapboxGeocodingClient = mapboxGeocodingClient;
    }

    @GetMapping("/config")
    public ResponseEntity<MapboxConfigVM> getConfig() {
        return ResponseEntity.ok(
            new MapboxConfigVM(mapboxGeocodingClient.isEnabled(), mapboxGeocodingClient.getStyleUrl(), mapboxGeocodingClient.getAccessToken())
        );
    }

    @GetMapping("/geocode")
    public ResponseEntity<List<MapboxPlace>> geocode(
        @RequestParam("query") String query,
        @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return ResponseEntity.ok(mapboxGeocodingClient.forwardGeocode(query, limit));
    }

    @GetMapping("/reverse")
    public ResponseEntity<MapboxPlace> reverseGeocode(
        @RequestParam("longitude") Double longitude,
        @RequestParam("latitude") Double latitude
    ) {
        return ResponseEntity.ok(mapboxGeocodingClient.reverseGeocode(longitude, latitude));
    }

    public record MapboxConfigVM(boolean enabled, String styleUrl, String publicToken) {}
}

