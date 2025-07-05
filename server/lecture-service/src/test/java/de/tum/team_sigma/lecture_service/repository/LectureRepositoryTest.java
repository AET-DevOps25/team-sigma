package de.tum.team_sigma.lecture_service.repository;

import de.tum.team_sigma.lecture_service.model.Lecture;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class LectureRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LectureRepository lectureRepository;

    @Test
    void findByCreatedByOrderByCreatedAtDesc_ShouldReturnLecturesInCorrectOrder() {
        Lecture lecture1 = new Lecture("Math 101", "user123");
        lecture1.setCreatedAt(LocalDateTime.now().minusDays(2));
        
        Lecture lecture2 = new Lecture("Physics 101", "user123");
        lecture2.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        Lecture lecture3 = new Lecture("Chemistry 101", "user123");
        lecture3.setCreatedAt(LocalDateTime.now());
        
        entityManager.persistAndFlush(lecture1);
        entityManager.persistAndFlush(lecture3);
        entityManager.persistAndFlush(lecture2);

        List<Lecture> results = lectureRepository.findByCreatedByOrderByCreatedAtDesc("user123");

        assertEquals(3, results.size());
        assertEquals("Chemistry 101", results.get(0).getName());
        assertEquals("Physics 101", results.get(1).getName());
        assertEquals("Math 101", results.get(2).getName());
    }

    @Test
    void findByCreatedByOrderByCreatedAtDesc_ShouldReturnOnlyUserLectures() {
        Lecture user1Lecture = new Lecture("Math 101", "user123");
        Lecture user2Lecture = new Lecture("Physics 101", "user456");
        
        entityManager.persistAndFlush(user1Lecture);
        entityManager.persistAndFlush(user2Lecture);

        List<Lecture> results = lectureRepository.findByCreatedByOrderByCreatedAtDesc("user123");

        assertEquals(1, results.size());
        assertEquals("Math 101", results.get(0).getName());
        assertEquals("user123", results.get(0).getCreatedBy());
    }

    @Test
    void findByCreatedByOrderByCreatedAtDesc_ShouldReturnEmptyListWhenNoLectures() {
        List<Lecture> results = lectureRepository.findByCreatedByOrderByCreatedAtDesc("nonexistent");
        assertTrue(results.isEmpty());
    }

    @Test
    void save_ShouldPersistLecture() {
        Lecture lecture = new Lecture("Test Lecture", "user123");

        Lecture saved = lectureRepository.save(lecture);

        assertNotNull(saved.getId());
        assertEquals("Test Lecture", saved.getName());
        assertEquals("user123", saved.getCreatedBy());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void findById_ShouldReturnLectureWhenExists() {
        Lecture lecture = new Lecture("Test Lecture", "user123");
        Lecture saved = entityManager.persistAndFlush(lecture);

        Optional<Lecture> found = lectureRepository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("Test Lecture", found.get().getName());
        assertEquals("user123", found.get().getCreatedBy());
    }

    @Test
    void findById_ShouldReturnEmptyWhenNotExists() {
        Optional<Lecture> found = lectureRepository.findById(999L);

        assertFalse(found.isPresent());
    }

    @Test
    void delete_ShouldRemoveLecture() {
        Lecture lecture = new Lecture("Test Lecture", "user123");
        Lecture saved = entityManager.persistAndFlush(lecture);

        lectureRepository.delete(saved);
        entityManager.flush();

        Optional<Lecture> found = lectureRepository.findById(saved.getId());
        assertFalse(found.isPresent());
    }

    @Test
    void findAll_ShouldReturnAllLectures() {
        Lecture lecture1 = new Lecture("Math 101", "user123");
        Lecture lecture2 = new Lecture("Physics 101", "user456");
        
        entityManager.persistAndFlush(lecture1);
        entityManager.persistAndFlush(lecture2);

        List<Lecture> results = lectureRepository.findAll();

        assertEquals(2, results.size());
    }

    @Test
    void update_ShouldModifyLecture() {
        Lecture lecture = new Lecture("Original Name", "user123");
        Lecture saved = entityManager.persistAndFlush(lecture);

        saved.setName("Updated Name");
        Lecture updated = lectureRepository.save(saved);
        entityManager.flush();

        assertEquals("Updated Name", updated.getName());
        assertEquals(saved.getId(), updated.getId());
    }
} 