FROM ubuntu:22.04 AS install-whisper
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update
RUN apt install -y git build-essential wget cmake && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /whisper
RUN git clone https://github.com/ggml-org/whisper.cpp.git .
RUN git checkout v1.7.1
RUN make
WORKDIR /whisper/models
RUN sh ./download-ggml-model.sh tiny.en

FROM node:22-bookworm-slim AS base
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app
RUN apt update && apt install -y git wget cmake ffmpeg curl make libsdl2-dev libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2 && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml* /app/
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
COPY package.json pnpm-lock.yaml* /app/
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json vite.config.ts /app/
COPY src /app/src
RUN pnpm build

FROM base
COPY static /app/static
COPY --from=install-whisper /whisper /app/data/libs/whisper
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY package.json /app/

ENV DATA_DIR_PATH=/app/data
ENV DOCKER=true
ENV WHISPER_MODEL=tiny.en
ENV KOKORO_MODEL_PRECISION=q4
ENV CONCURRENCY=1
ENV VIDEO_CACHE_SIZE_IN_BYTES=2097152000

RUN node dist/scripts/install.js

CMD ["pnpm", "start"]
