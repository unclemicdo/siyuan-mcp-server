# Changelog

## Unreleased

### Changed

- rewrote the Chinese and English README files around value proposition, scope, and safety boundaries
- added startup warnings for non-local and non-HTTPS `SIYUAN_BASE_URL` targets
- improved connection and authorization error messages
- enforced read-only SQL by rejecting non-`SELECT`, unsafe keywords, and multi-statement payloads before sending queries to SiYuan
- added automated tests for endpoint-risk warnings and SQL safety rules
- added CI, security policy, and local verification guidance
