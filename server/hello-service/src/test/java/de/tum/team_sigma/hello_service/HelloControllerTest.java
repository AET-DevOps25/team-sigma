package de.tum.team_sigma.hello_service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/hello/ returns generic greeting")
    void helloEndpointShouldReturnGreeting() throws Exception {
        mockMvc.perform(get("/api/hello/"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello!"));
    }

    @Test
    @DisplayName("GET /api/hello/{name} returns personalised greeting")
    void helloEndpointShouldReturnPersonalisedGreeting() throws Exception {
        mockMvc.perform(get("/api/hello/Ada"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello Ada!"));
    }
} 