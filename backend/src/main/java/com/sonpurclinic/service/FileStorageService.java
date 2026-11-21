package com.sonpurclinic.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");
    private final Path root;

    public FileStorageService(@Value("${app.uploads.directory:./uploads}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
        try { Files.createDirectories(root.resolve("payment")); Files.createDirectories(root.resolve("qr")); Files.createDirectories(root.resolve("logo")); }
        catch (IOException e) { throw new IllegalStateException("Could not create upload directory", e); }
    }

    public String storeImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an image file");
        if (file.getSize() > 5L * 1024 * 1024) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 5 MB or smaller");
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!ALLOWED.contains(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG and WEBP images are supported");
        String extension = switch (type) { case "image/png" -> ".png"; case "image/webp" -> ".webp"; default -> ".jpg"; };
        String name = UUID.randomUUID() + extension;
        try {
            Path target = root.resolve(folder).resolve(name).normalize();
            if (!target.startsWith(root)) throw new SecurityException("Invalid file path");
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return folder + "/" + name;
        } catch (IOException e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save uploaded image"); }
    }

    public Resource load(String relativePath) {
        try {
            Path path = root.resolve(relativePath).normalize();
            if (!path.startsWith(root)) throw new SecurityException("Invalid file path");
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) return resource;
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        } catch (IOException e) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"); }
    }
}
