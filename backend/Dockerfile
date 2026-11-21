# Runtime image. The start script builds this JAR with the official Maven image first.
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY target/sonpur-dental-clinic-api-1.0.0.jar /app/app.jar
RUN mkdir -p /app/extracted /app/uploads \
    && cd /app/extracted \
    && jar xf /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-cp", "/app/extracted/BOOT-INF/classes:/app/extracted/BOOT-INF/lib/*", "com.sonpurclinic.SonpurDentalClinicApplication"]
