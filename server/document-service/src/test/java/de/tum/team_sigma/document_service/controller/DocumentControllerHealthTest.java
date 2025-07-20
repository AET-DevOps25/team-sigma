package de.tum.team_sigma.document_service.controller;

import de.tum.team_sigma.document_service.service.DocumentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentController.class)
class DocumentControllerHealthTest {

    @Autowired
    private MockMvc mockMvc;

    // Mock service to avoid full application context and external dependencies
    @MockBean
    private DocumentService documentService;

    @Test
    @DisplayName("GET /api/documents/health returns health string")
    void healthEndpointShouldReturnRunningString() throws Exception {
        mockMvc.perform(get("/api/documents/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Document Service is running!"));
    }
} 