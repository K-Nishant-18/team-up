package com.teamup.config;

import com.teamup.post.Post;
import com.teamup.post.PostRepository;
import com.teamup.post.PostRole;
import com.teamup.request.JoinRequest;
import com.teamup.request.JoinRequestRepository;
import com.teamup.request.Notification;
import com.teamup.request.NotificationRepository;
import com.teamup.comment.Comment;
import com.teamup.comment.CommentRepository;
import com.teamup.user.User;
import com.teamup.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final NotificationRepository notificationRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      PostRepository postRepository,
                      JoinRequestRepository joinRequestRepository,
                      NotificationRepository notificationRepository,
                      CommentRepository commentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.notificationRepository = notificationRepository;
        this.commentRepository = commentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        String password = passwordEncoder.encode("teamup-demo-2026");

        User samira = user("Samira Nair", "samira@teamup.dev", password, "IIIT Hyderabad", "Interaction Design", "3",
                "Product-minded builder. Turning fuzzy ideas into things people can actually use.",
                "Hyderabad, India", User.Availability.openToJoin,
                skills(skill("React", "Advanced"), skill("Product Design", "Advanced"), skill("Research", "Intermediate")),
                List.of("Climate tech", "Accessibility", "Writing"),
                "https://github.com/samira", "https://linkedin.com/in/samira", "https://samira.dev");
        samira.setVerified(true);
        samira.setInterests(List.of("Climate tech", "Accessibility", "Writing"));

        User aarav = user("Aarav Mehta", "aarav@teamup.dev", password, "IIT Bombay", "Computer Science", "4",
                "Product-minded engineer turning campus problems into useful tools.",
                "Mumbai, India", User.Availability.lookingForTeammates,
                skills(skill("Node.js", "Advanced"), skill("MongoDB", "Advanced"), skill("Strategy", "Intermediate")),
                List.of("Food waste", "Marketplaces"), "#", "#", "#");

        User maya = user("Maya Iyer", "maya@teamup.dev", password, "VIT Vellore", "Interaction Design", "2",
                "Design systems, open source, and making complex things feel simple.",
                "Vellore, India", User.Availability.openToJoin,
                skills(skill("Figma", "Advanced"), skill("TypeScript", "Intermediate"), skill("Accessibility", "Intermediate")),
                List.of("Open source", "Civic tech"), "#", "#", "#");

        User rohan = user("Rohan Kapoor", "rohan@teamup.dev", password, "BITS Pilani", "Computer Science", "3",
                "Backend builder who likes experiments with a clear human outcome.",
                "Pune, India", User.Availability.openToJoin,
                skills(skill("Python", "Advanced"), skill("FastAPI", "Advanced"), skill("ML", "Intermediate")),
                List.of("Edtech", "Study tools"), "#", "#", "#");

        User nisha = user("Nisha Shah", "nisha@teamup.dev", password, "IIIT Hyderabad", "CS + Design", "3",
                "Strategy and systems for calmer student life.",
                "Hyderabad, India", User.Availability.openToJoin,
                skills(skill("Next.js", "Advanced"), skill("UX Research", "Advanced"), skill("Strategy", "Advanced")),
                List.of("Product planning"), "#", "#", "#");

        userRepository.saveAll(List.of(samira, aarav, maya, rohan, nisha));

        Post greencart = post("GreenCart — campus food, zero waste",
                "A smart campus marketplace that connects surplus food with students before it becomes waste. We have the first user interviews and a rough prototype; now we need a team that cares about shipping something useful.",
                "Hackathon", aarav, "Open", "online", Instant.now().plus(9, ChronoUnit.DAYS),
                roles(role("Product Designer", 1, List.of("Figma", "Research")), role("Data / backend builder", 1, List.of("Node.js", "Data"))));

        Post civic = post("Open-source design system for civic tech",
                "A tiny, accessible component library for student-led civic projects and community builders. No pressure, just thoughtful commits and a love for making the web easier to use.",
                "OpenSource", maya, "Open", "hybrid", Instant.now().plus(15, ChronoUnit.DAYS),
                roles(role("Designer", 1, List.of("Figma")), role("TypeScript builder", 1, List.of("TypeScript", "Accessibility"))));

        Post studloop = post("StudyLoop — make group study actually work",
                "A quiet accountability app for exam season. We have the research and a rough prototype — looking for a backend builder to help make the first real release.",
                "ClassProject", rohan, "Open", "offline", Instant.now().plus(23, ChronoUnit.DAYS),
                roles(role("Backend builder", 1, List.of("Python", "FastAPI")), role("Research + frontend", 1, List.of("Research"))));

        Post orbit = post("Orbit — a calmer way to plan college life",
                "We are exploring a student operating system for deadlines, clubs, and the things in between. Looking for product thinkers who can help shape the first experiment.",
                "StartupIdea", nisha, "Open", "online", Instant.now().plus(31, ChronoUnit.DAYS),
                roles(role("Product thinker", 1, List.of("Next.js", "UX Research", "Strategy"))));

        List<Post> posts = new ArrayList<>();
        postRepository.save(greencart);
        postRepository.save(civic);
        postRepository.save(studloop);
        postRepository.save(orbit);
        posts.add(greencart);
        posts.add(civic);
        posts.add(studloop);
        posts.add(orbit);

        JoinRequest pending = new JoinRequest();
        pending.setPost(greencart);
        pending.setRequester(samira);
        pending.setRole("Product designer");
        pending.setMessage("I love the mission and would love to shape the core flow.");
        pending.setStatus(JoinRequest.Status.pending);
        joinRequestRepository.save(pending);

        JoinRequest accepted = new JoinRequest();
        accepted.setPost(studloop);
        accepted.setRequester(samira);
        accepted.setRole("Research + frontend");
        accepted.setMessage("Happy to dig into research and prototype together.");
        accepted.setStatus(JoinRequest.Status.accepted);
        accepted.setRespondedAt(Instant.now());
        joinRequestRepository.save(accepted);

        notification(samira, Notification.Type.joinRequest,
                "Aarav Mehta invited you to join GreenCart", greencart, pending);
        notification(samira, Notification.Type.newMessage,
                "Maya replied to your introduction", civic, null);
        notification(samira, Notification.Type.requestAccepted,
                "You joined the StudyLoop workspace", studloop, accepted);

        comment(greencart, rohan, "The research you shared around surplus food is really strong. I can take the data side if we decide on a stack soon.");
        comment(greencart, maya, "Happy to help shape the design system early. Want me to sketch the empty states?");
        comment(civic, samira, "Love the accessibility-first angle. I would test a dark-mode reading scale with students first.");
        comment(studloop, aarav, "I have built a small scheduler before — happy to share what worked and what did not.");
        comment(orbit, maya, "The 'calmer' framing is a great North Star. A weekly-planning view could be the first slice.");

        log.info("Seeded demo users and posts (demo password: teamup-demo-2026)");
    }

    private User user(String name, String email, String password, String college, String major, String year,
                      String bio, String location, User.Availability availability,
                      List<User.Skill> skills, List<String> interests, String github, String linkedin, String portfolio) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setCollege(college);
        u.setMajor(major);
        u.setYear(year);
        u.setBio(bio);
        u.setLocation(location);
        u.setAvailability(availability);
        u.setSkills(skills);
        u.setInterests(interests);
        User.UserLinks links = new User.UserLinks();
        links.setGithub(github);
        links.setLinkedin(linkedin);
        links.setPortfolio(portfolio);
        u.setLinks(links);
        return u;
    }

    private List<User.Skill> skills(User.Skill... skills) {
        return new ArrayList<>(List.of(skills));
    }

    private User.Skill skill(String name, String proficiency) {
        return new User.Skill(name, proficiency);
    }

    private Post post(String title, String description, String category, User creator, String status,
                      String mode, Instant deadline, List<PostRole> rolesRequired) {
        Post p = new Post();
        p.setTitle(title);
        p.setDescription(description);
        p.setCategory(Post.Category.valueOf(category));
        p.setCreator(creator);
        p.setStatus(Post.Status.valueOf(status));
        p.setMode(Post.Mode.valueOf(mode));
        p.setDeadline(deadline);
        for (PostRole role : rolesRequired) {
            role.setPost(p);
        }
        p.setRolesRequired(rolesRequired);
        return p;
    }

    private List<PostRole> roles(PostRole... roles) {
        return new ArrayList<>(List.of(roles));
    }

    private PostRole role(String name, int count, List<String> skills) {
        PostRole r = new PostRole();
        r.setRoleName(name);
        r.setCount(count);
        r.setSkills(new ArrayList<>(skills));
        return r;
    }

    private void notification(User user, Notification.Type type, String message, Post post, JoinRequest request) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setMessage(message);
        n.setRelatedPost(post);
        n.setRelatedRequest(request);
        n.setRead(false);
        notificationRepository.save(n);
    }

    private void comment(Post post, User author, String body) {
        Comment c = new Comment();
        c.setPost(post);
        c.setAuthor(author);
        c.setBody(body);
        commentRepository.save(c);
    }
}
