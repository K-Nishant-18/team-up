package com.teamup.controller;

import com.teamup.security.JwtService;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import com.teamup.user.UserView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record SignupBody(@NotBlank String name,
                             @NotBlank @Email String email,
                             @NotBlank @Size(min = 8) String password) {}

    public record LoginBody(@NotBlank @Email String email, @NotBlank String password) {}

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupBody body) {
        if (userRepository.existsByEmail(body.email().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User();
        user.setName(body.name());
        user.setEmail(body.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(body.password()));
        user = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "user", UserView.from(user),
                "accessToken", jwtService.generateToken(user.getId(), user.getRole().name(), user.getEmail())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginBody body) {
        User user = userRepository.findByEmail(body.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwordEncoder.matches(body.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return ResponseEntity.ok(Map.of(
                "user", UserView.from(user),
                "accessToken", jwtService.generateToken(user.getId(), user.getRole().name(), user.getEmail())
        ));
    }
}
