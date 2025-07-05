package de.tum.team_sigma.lecture_service;

import de.tum.team_sigma.lecture_service.client.DocumentServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class LectureServiceApplicationTests {

	@MockBean
	private DocumentServiceClient documentServiceClient;

	@Test
	void contextLoads() {
	}

	@Test
	void applicationStartsSuccessfully() {
	}
}
