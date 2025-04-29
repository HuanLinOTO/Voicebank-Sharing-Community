-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vocaloid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "engines" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Voicebank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vocaloidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "samplePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "voiceprovider" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Voicebank_vocaloidId_fkey" FOREIGN KEY ("vocaloidId") REFERENCES "Vocaloid" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Voicebank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vocaloidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "coverPath" TEXT,
    "bilibiliUrl" TEXT,
    "lyrics" TEXT,
    "creator" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Song_vocaloidId_fkey" FOREIGN KEY ("vocaloidId") REFERENCES "Vocaloid" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Song_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "engineType" TEXT,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tutorial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
