package de.tum.team_sigma.lecture_service.controller;

import de.tum.team_sigma.lecture_service.dto.LectureRequest;
import de.tum.team_sigma.lecture_service.dto.LectureResponse;
import de.tum.team_sigma.lecture_service.service.LectureService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LectureController.class)
public class LectureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LectureService lectureService;

    @Test
    public void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/lectures/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Lecture Service is running"));
    }

    @Test
    public void testGetLecturesByUserId() throws Exception {
        // Mock data
        LectureResponse lecture1 = new LectureResponse(1L, "Math 101", "user123", LocalDateTime.now());
        LectureResponse lecture2 = new LectureResponse(2L, "Physics 101", "user123", LocalDateTime.now());
        List<LectureResponse> lectures = Arrays.asList(lecture1, lecture2);

        when(lectureService.getLecturesByUserId(anyString())).thenReturn(lectures);

        mockMvc.perform(get("/api/lectures/user/user123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Math 101"))
                .andExpect(jsonPath("$[1].name").value("Physics 101"));
    }

    @Test
    public void testCreateLecture() throws Exception {
        LectureResponse response = new LectureResponse(1L, "New Lecture", "user123", LocalDateTime.now());
        when(lectureService.createLecture(any(LectureRequest.class))).thenReturn(response);

        String requestBody = """
                {
                    "name": "New Lecture",
                    "userId": "user123"
                }
                """;

        mockMvc.perform(post("/api/lectures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Lecture"))
                .andExpect(jsonPath("$.createdBy").value("user123"));
    }
} 