# Twitch Badge Check

Zeigt die aktuell verfügbaren Twitch-Badges und welche davon dir fehlen.

- Events und Badges: [StreamDatabase](https://www.streamdatabase.com/events)
- Besitz: Twitchs inoffizielle GraphQL-Schnittstelle (`gql.twitch.tv`), abgefragt per Lesezeichen im Browser des Nutzers. Der Login verlässt twitch.tv nicht, der Server sieht die Badge-Liste nie.
- Nicht mit Twitch oder StreamDatabase verbunden.

## Betrieb (Docker + Traefik)

```bash
cp .env.example .env   # DOMAIN und Traefik-Namen anpassen
docker compose pull && docker compose up -d
```

Das Image wird per GitHub Actions gebaut: `ghcr.io/t0biii/twitch-badge-check:latest` (amd64 und arm64).

## Lokal testen

```bash
docker build -t twitch-badge-check .
docker run --rm -p 8099:3000 twitch-badge-check
```
