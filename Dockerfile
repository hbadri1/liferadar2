FROM eclipse-temurin:17-jre-focal

# Set JVM options for production
ENV _JAVA_OPTIONS="-Xmx1024m -Xms256m"

# Add curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the JAR file
COPY target/liferadar-*.jar app.jar

# Expose port (application will run on 8080 internally, mapped to 80 in compose)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=40 CMD curl -f http://localhost:8080/management/health || exit 1

# Run the application
ENTRYPOINT ["java","-jar","/app.jar"]

