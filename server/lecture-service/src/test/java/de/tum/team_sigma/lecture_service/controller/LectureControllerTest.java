package de.tum.team_sigma.lecture_service.controller;

import de.tum.team_sigma.lecture_service.dto.LectureRequest;
import de.tum.team_sigma.lecture_service.dto.LectureResponse;
import de.tum.team_sigma.lecture_service.service.LectureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class LectureControllerTest {

    private MockMvc mockMvc;

    @Mock
    private LectureService lectureService;

    @InjectMocks
    private LectureController lectureController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(lectureController).build();
    }

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
    public void testGetLecturesByUserId_ServiceError() throws Exception {
        when(lectureService.getLecturesByUserId(anyString())).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/api/lectures/user/user123"))
                .andExpect(status().isInternalServerError());
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

    @Test
    public void testCreateLecture_ServiceError() throws Exception {
        when(lectureService.createLecture(any(LectureRequest.class))).thenThrow(new RuntimeException("Service error"));

        String requestBody = """
                {
                    "name": "New Lecture",
                    "userId": "user123"
                }
                """;

        mockMvc.perform(post("/api/lectures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void testCreateLecture_InvalidRequest() throws Exception {
        String requestBody = """
                {
                    "name": "",
                    "userId": ""
                }
                """;

        mockMvc.perform(post("/api/lectures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetLectureById() throws Exception {
        LectureResponse response = new LectureResponse(1L, "Test Lecture", "user123", LocalDateTime.now());
        when(lectureService.getLectureById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/lectures/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test Lecture"));
    }

    @Test
    public void testGetLectureById_NotFound() throws Exception {
        when(lectureService.getLectureById(999L)).thenThrow(new RuntimeException("Lecture not found with id: 999"));

        mockMvc.perform(get("/api/lectures/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testGetLectureById_ServiceError() throws Exception {
        when(lectureService.getLectureById(1L)).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/api/lectures/1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void testUpdateLecture() throws Exception {
        LectureResponse response = new LectureResponse(1L, "Updated Lecture", "user123", LocalDateTime.now());
        when(lectureService.updateLecture(anyLong(), any(LectureRequest.class))).thenReturn(response);

        String requestBody = """
                {
                    "name": "Updated Lecture",
                    "userId": "user123"
                }
                """;

        mockMvc.perform(put("/api/lectures/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Lecture"));
    }

    @Test
    public void testUpdateLecture_NotFound() throws Exception {
        when(lectureService.updateLecture(anyLong(), any(LectureRequest.class)))
                .thenThrow(new RuntimeException("Lecture not found with id: 999"));

        String requestBody = """
                {
                    "name": "Updated Lecture",
                    "userId": "user123"
                }
                """;

        mockMvc.perform(put("/api/lectures/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteLecture() throws Exception {
        doNothing().when(lectureService).deleteLecture(1L);

        mockMvc.perform(delete("/api/lectures/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testDeleteLecture_NotFound() throws Exception {
        doThrow(new RuntimeException("Lecture not found with id: 999")).when(lectureService).deleteLecture(999L);

        mockMvc.perform(delete("/api/lectures/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteLecture_ServiceError() throws Exception {
        doThrow(new RuntimeException("Service error")).when(lectureService).deleteLecture(1L);

        mockMvc.perform(delete("/api/lectures/1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    public void testGetAllLectures() throws Exception {
        List<LectureResponse> lectures = Arrays.asList(
                new LectureResponse(1L, "Math 101", "user123", LocalDateTime.now()),
                new LectureResponse(2L, "Physics 101", "user456", LocalDateTime.now())
        );
        when(lectureService.getAllLectures()).thenReturn(lectures);

        mockMvc.perform(get("/api/lectures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Math 101"))
                .andExpect(jsonPath("$[1].name").value("Physics 101"));
    }

    @Test
    public void testGetAllLectures_ServiceError() throws Exception {
        when(lectureService.getAllLectures()).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/api/lectures"))
                .andExpect(status().isInternalServerError());
    }
} 