# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@zerlin.io.

**Please do not report security vulnerabilities through public GitHub issues.**

We will respond within 48 hours and work with you to resolve the issue.

## Security Best Practices

- Never commit `.env` files
- Use strong database passwords
- Keep dependencies updated
- Enable CORS only for trusted origins
- Use HTTPS in production
- Implement rate limiting
- Validate all user inputs
- Use prepared statements for database queries

## Known Security Considerations

- API keys should be stored in environment variables
- Database credentials should be rotated regularly
- Redis should be password-protected in production
- Smart contracts should be audited before mainnet deployment
