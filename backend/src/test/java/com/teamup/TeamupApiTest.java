package com.teamup;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TeamupApiTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    private String login(String email, String password) throws Exception {
        MvcResult res = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    void loginSucceedsAndWrongPasswordFails() throws Exception {
        String token = login("samira@teamup.dev", "teamup-demo-2026");
        assertThat(token).isNotBlank();

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"samira@teamup.dev\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonCreatorCannotPatchPost() throws Exception {
        String token = login("samira@teamup.dev", "teamup-demo-2026");
        // Samira is NOT the creator of post 2 (created by Maya)
        mvc.perform(patch("/api/posts/2")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"hijacked\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void joinRequestLoopAcceptAddsMember() throws Exception {
        String maya = login("maya@teamup.dev", "teamup-demo-2026");   // creator of post 2
        String nisha = login("nisha@teamup.dev", "teamup-demo-2026");

        // 1. Submit a join request
        mvc.perform(post("/api/posts/2/join")
                        .header("Authorization", "Bearer " + nisha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"Designer\",\"message\":\"I fit this.\"}"))
                .andExpect(status().isCreated());

        // 2. Duplicate request -> 409
        mvc.perform(post("/api/posts/2/join")
                        .header("Authorization", "Bearer " + nisha)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"Designer\",\"message\":\"again\"}"))
                .andExpect(status().isConflict());

        // 3. Creator lists pending requests and accepts the first
        MvcResult list = mvc.perform(get("/api/posts/2/requests").header("Authorization", "Bearer " + maya))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode reqs = mapper.readTree(list.getResponse().getContentAsString());
        assertThat(reqs.isArray()).isTrue();
        assertThat(reqs.size()).isGreaterThanOrEqualTo(1);

        long reqId = reqs.get(0).get("id").asLong();
        mvc.perform(patch("/api/posts/2/requests/" + reqId)
                        .header("Authorization", "Bearer " + maya)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"action\":\"accept\"}"))
                .andExpect(status().isOk());

        // 4. Accepted member now shows on the post
        MvcResult post = mvc.perform(get("/api/posts/2")).andExpect(status().isOk()).andReturn();
        JsonNode members = mapper.readTree(post.getResponse().getContentAsString()).get("currentMembers");
        boolean found = false;
        for (JsonNode m : members) {
            if ("Nisha Shah".equals(m.get("userName").asText())) { found = true; break; }
        }
        assertThat(found).isTrue();
    }

    @Test
    void commentsCanBeListedAndCreated() throws Exception {
        MvcResult list = mvc.perform(get("/api/posts/1/comments")).andExpect(status().isOk()).andReturn();
        assertThat(mapper.readTree(list.getResponse().getContentAsString()).isArray()).isTrue();

        String token = login("samira@teamup.dev", "teamup-demo-2026");
        mvc.perform(post("/api/posts/1/comments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"Hello from a test\"}"))
                .andExpect(status().isCreated());

        // Empty comment -> 400
        mvc.perform(post("/api/posts/1/comments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"body\":\"\"}"))
                .andExpect(status().isBadRequest());
    }
}
