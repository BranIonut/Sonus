# Sonus - Distributed Audio Streaming Platform

![Sonus Platform](https://img.shields.io/badge/Status-Active-success)
![Kotlin](https://img.shields.io/badge/Language-Kotlin-purple)
![Spring Boot](https://img.shields.io/badge/Framework-Spring_Boot-green)
![React](https://img.shields.io/badge/Frontend-React-blue)

Sonus is a scalable, microservices-based audio streaming application designed for high-performance and non-blocking streaming. The platform provides functionalities for users to stream music, for artists to upload content, and uses an event-driven architecture to compute analytics and recommendations in real-time.

## 🏗 System Architecture & Technologies

The platform is divided into a React-based frontend and a robust Kotlin Spring Boot backend ecosystem:

- **Backend:** Kotlin, Spring Boot, Spring WebFlux, Project Reactor
- **Frontend:** React, TypeScript, TailwindCSS
- **Databases:** PostgreSQL (Relational Data), MongoDB (NoSQL Data)
- **Object Storage:** MinIO (S3-compatible) for storing audio chunks and images
- **Message Broker:** Apache Kafka for asynchronous event-driven communication
- **Search & Analytics:** Elasticsearch for complex queries and statistics
- **API Gateway:** Centralized entry point, routing, and security.

### Core Microservices

1. **Streaming Service:** Serves audio files reactively. Fetches streams from MinIO and sends them to the client via `Flux<DataBuffer>` to ensure non-blocking memory usage. Publishes events to Kafka upon song plays.
2. **User Auth & Management Service:** Handles JWT-based authentication, user roles (USER / ARTIST), and account management using Spring Security and PostgreSQL.
3. **Upload Content Service / Artist Service:** Allows artists to publish new tracks and albums. Uploads raw files to MinIO, saves metadata in PostgreSQL, and produces Kafka events to notify subscribers.
4. **Analytics Service:** Acts as a Kafka consumer for "song played" events. Indexes data in Elasticsearch/MongoDB to generate user preference reports (top artists, top genres) and recommendations.
5. **Notification Service:** Decoupled service that listens to artist updates and sends real-time notifications to subscribed users.

---

## 🔄 System Workflows

The system's core functionalities are best illustrated through the following interaction diagrams:

### 1. User Signup & Authentication

The authentication flow utilizes JSON Web Tokens (JWT) for secure, stateless authorization across all microservices.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API Gateway
    participant User Auth Service
    participant AuthDB as Auth DB<br/>(PostgreSQL)
    participant Target Microservice

    %% 1. User Registration (Signup)
    Client->>API Gateway: POST /api/auth/signup (User Data)
    API Gateway->>User Auth Service: Forward Signup Request
    User Auth Service->>AuthDB: Check if User Exists
    AuthDB-->>User Auth Service: User Not Found
    User Auth Service->>User Auth Service: Hash Password
    User Auth Service->>AuthDB: Insert New User Record
    AuthDB-->>User Auth Service: Success
    User Auth Service-->>API Gateway: 201 Created
    API Gateway-->>Client: Signup Successful

    %% 2. User Authentication (Login)
    Client->>API Gateway: POST /api/auth/login (Credentials)
    API Gateway->>User Auth Service: Forward Login Request
    User Auth Service->>AuthDB: Fetch User Details
    AuthDB-->>User Auth Service: Return Hashed Password
    User Auth Service->>User Auth Service: Validate Password Match
    User Auth Service->>User Auth Service: Generate JWT Access & Refresh Tokens
    User Auth Service-->>API Gateway: 200 OK (Tokens)
    API Gateway-->>Client: Store Tokens (Local Storage/Cookies)

    %% 3. Authorization (Accessing Protected Route)
    Client->>API Gateway: GET /api/protected-resource<br/>(Header: Bearer JWT)
    API Gateway->>API Gateway: Validate JWT Signature & Expiration
    alt Invalid/Expired Token
        API Gateway-->>Client: 401 Unauthorized
    else Valid Token
        API Gateway->>Target Microservice: Forward Request<br/>(Inject User-ID Header)
        Target Microservice-->>API Gateway: Resource Data (200 OK)
        API Gateway-->>Client: Display Protected Data
    end
```

### 2. Audio Streaming

The streaming functionality uses reactive programming (Spring WebFlux) to serve partial content (HTTP 206) chunk by chunk, drastically reducing server memory overhead.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API Gateway
    participant Streaming Service
    participant Database as Database<br/>(MongoDB)
    participant ObjectStorage as Object Storage<br/>(MinIO)

    Client->>API Gateway: GET /api/streaming/{songId}<br/>(Range Header)
    API Gateway->>Streaming Service: Forward Request
    Streaming Service->>Database: Fetch Song Metadata & Object Key
    Database-->>Streaming Service: Returns Object Key (e.g., 'audio/123.mp3')
    Streaming Service->>ObjectStorage: Get Object Chunk<br/>(HTTP Range Request)
    ObjectStorage-->>Streaming Service: Audio File Chunk
    Streaming Service-->>API Gateway: Audio Stream<br/>(206 Partial Content)
    API Gateway-->>Client: Stream Audio to Player
```

### 3. Content Upload (Artist Flow)

Artists upload their music through a dedicated service. The actual audio files are stored securely in MinIO, while the structural metadata is persisted in the relational database.

```mermaid
sequenceDiagram
    autonumber
    actor Artist
    participant API Gateway
    participant Upload Content Service
    participant Database as Database<br/>(MongoDB)
    participant ObjectStorage as Object Storage<br/>(MinIO)
    participant MessageBroker as Message Broker<br/>(Kafka)

    Artist->>API Gateway: POST /api/upload<br/>(Multipart: Audio, Cover Art, Metadata)
    API Gateway->>Upload Content Service: Forward Upload Request
    Upload Content Service->>ObjectStorage: Upload Audio File
    ObjectStorage-->>Upload Content Service: Return Audio Key/URL
    Upload Content Service->>ObjectStorage: Upload Cover Art Image
    ObjectStorage-->>Upload Content Service: Return Image Key/URL
    Upload Content Service->>Database: Save Song/Album Metadata & URLs
    Database-->>Upload Content Service: Confirmation (ID generated)
    Upload Content Service->>MessageBroker: Publish 'ContentUploaded' Event
    Upload Content Service-->>API Gateway: 201 Created (Upload Success)
    API Gateway-->>Artist: Display Success Message
```

### 4. Recommendations & Analytics

Every time a user listens to a song, the system asynchronously calculates statistics without blocking the audio stream.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API Gateway
    participant Streaming Service
    participant MessageBroker as Message Broker<br/>(Kafka)
    participant Analytics Service
    participant DocumentDB as Document DB<br/>(MongoDB)

    %% Part 1: Async Analytics Processing
    Client->>API Gateway: Play Song (Trigger Playback Event)
    API Gateway->>Streaming Service: Forward Playback Data
    Streaming Service->>MessageBroker: Publish 'SongPlayed' Event (userId, songId)
    MessageBroker->>Analytics Service: Consume 'SongPlayed' Event
    Analytics Service->>DocumentDB: Store Play History Record
    Analytics Service->>Analytics Service: Calculate Recommendations<br/>(e.g., Collaborative Filtering)
    Analytics Service->>DocumentDB: Update User's Recommended Songs List

    %% Part 2: Client Interface Updates
    Client->>API Gateway: GET /api/analytics/users/{userId}/recommendations
    API Gateway->>Analytics Service: Forward Request
    Analytics Service->>DocumentDB: Fetch Recommended Song IDs/Metadata
    DocumentDB-->>Analytics Service: Return Recommendations Data
    Analytics Service-->>API Gateway: Recommendations Response
    API Gateway-->>Client: Render Recommended Content
```

## 🚀 Getting Started

To run the Sonus backend locally, make sure you have Docker installed. The project provides a `docker-compose.yml` to spin up all necessary infrastructure (PostgreSQL, MongoDB, MinIO, Kafka, Elasticsearch).

1. Clone the repository
2. Run infrastructure containers:
   ```bash
   docker-compose up -d
   ```
3. Start the individual microservices via your IDE or Gradle:
   ```bash
   ./gradlew bootRun
   ```

*Note: For the frontend repository, navigate to `sonus-frontend` and use `npm install` and `npm run dev`.*
