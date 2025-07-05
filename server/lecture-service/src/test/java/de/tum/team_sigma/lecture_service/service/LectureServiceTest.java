package de.tum.team_sigma.lecture_service.service;

import de.tum.team_sigma.lecture_service.client.DocumentServiceClient;
import de.tum.team_sigma.lecture_service.dto.LectureRequest;
import de.tum.team_sigma.lecture_service.dto.LectureResponse;
import de.tum.team_sigma.lecture_service.model.Lecture;
import de.tum.team_sigma.lecture_service.repository.LectureRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LectureServiceTest {

    @Mock
    private LectureRepository lectureRepository;

    @Mock
    private DocumentServiceClient documentServiceClient;

    @InjectMocks
    private LectureService lectureService;

    private Lecture mockLecture;
    private LectureRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockLecture = new Lecture("Test Lecture", "user123");
        mockLecture.setId(1L);
        mockLecture.setCreatedAt(LocalDateTime.now());

        mockRequest = new LectureRequest();
        mockRequest.setName("Test Lecture");
        mockRequest.setUserId("user123");
    }

    @Test
    void createLecture_Success() {
        when(lectureRepository.save(any(Lecture.class))).thenReturn(mockLecture);

        LectureResponse result = lectureService.createLecture(mockRequest);

        assertNotNull(result);
        assertEquals(mockLecture.getId(), result.getId());
        assertEquals(mockLecture.getName(), result.getName());
        assertEquals(mockLecture.getCreatedBy(), result.getCreatedBy());
        verify(lectureRepository, times(1)).save(any(Lecture.class));
    }

    @Test
    void createLecture_ThrowsException_WhenRepositoryFails() {
        when(lectureRepository.save(any(Lecture.class))).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            lectureService.createLecture(mockRequest);
        });
        assertEquals("Failed to create lecture", exception.getMessage());
    }

    @Test
    void getLecturesByUserId_Success() {
        List<Lecture> mockLectures = Arrays.asList(
            mockLecture,
            new Lecture("Another Lecture", "user123")
        );
        when(lectureRepository.findByCreatedByOrderByCreatedAtDesc("user123")).thenReturn(mockLectures);

        List<LectureResponse> result = lectureService.getLecturesByUserId("user123");

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test Lecture", result.get(0).getName());
        verify(lectureRepository, times(1)).findByCreatedByOrderByCreatedAtDesc("user123");
    }

    @Test
    void getLectureById_Success() {
        when(lectureRepository.findById(1L)).thenReturn(Optional.of(mockLecture));

        LectureResponse result = lectureService.getLectureById(1L);

        assertNotNull(result);
        assertEquals(mockLecture.getId(), result.getId());
        assertEquals(mockLecture.getName(), result.getName());
        verify(lectureRepository, times(1)).findById(1L);
    }

    @Test
    void getLectureById_ThrowsException_WhenNotFound() {
        when(lectureRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            lectureService.getLectureById(999L);
        });
        assertTrue(exception.getMessage().contains("Lecture not found with id: 999"));
    }

    @Test
    void updateLecture_Success() {
        LectureRequest updateRequest = new LectureRequest();
        updateRequest.setName("Updated Lecture");
        updateRequest.setUserId("user123");

        when(lectureRepository.findById(1L)).thenReturn(Optional.of(mockLecture));
        when(lectureRepository.save(any(Lecture.class))).thenReturn(mockLecture);

        LectureResponse result = lectureService.updateLecture(1L, updateRequest);

        assertNotNull(result);
        verify(lectureRepository, times(1)).findById(1L);
        verify(lectureRepository, times(1)).save(any(Lecture.class));
    }

    @Test
    void updateLecture_ThrowsException_WhenNotFound() {
        when(lectureRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            lectureService.updateLecture(999L, mockRequest);
        });
        assertTrue(exception.getMessage().contains("Failed to update lecture"));
    }

    @Test
    void deleteLecture_Success() {
        when(lectureRepository.findById(1L)).thenReturn(Optional.of(mockLecture));
        when(documentServiceClient.deleteDocumentsByLecture(anyString()))
            .thenReturn(new ResponseEntity<>(HttpStatus.OK));

        lectureService.deleteLecture(1L);

        verify(lectureRepository, times(1)).findById(1L);
        verify(documentServiceClient, times(1)).deleteDocumentsByLecture("1");
        verify(lectureRepository, times(1)).delete(mockLecture);
    }

    @Test
    void deleteLecture_ThrowsException_WhenNotFound() {
        when(lectureRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            lectureService.deleteLecture(999L);
        });
        assertTrue(exception.getMessage().contains("Failed to delete lecture"));
    }

    @Test
    void deleteLecture_HandlesDocumentServiceFailure() {
        when(lectureRepository.findById(1L)).thenReturn(Optional.of(mockLecture));
        when(documentServiceClient.deleteDocumentsByLecture(anyString()))
            .thenThrow(new RuntimeException("Document service unavailable"));

        assertDoesNotThrow(() -> lectureService.deleteLecture(1L));

        verify(lectureRepository, times(1)).delete(mockLecture);
    }

    @Test
    void getAllLectures_Success() {
        List<Lecture> mockLectures = Arrays.asList(
            mockLecture,
            new Lecture("Another Lecture", "user456")
        );
        when(lectureRepository.findAll()).thenReturn(mockLectures);

        List<LectureResponse> result = lectureService.getAllLectures();

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(lectureRepository, times(1)).findAll();
    }
} 