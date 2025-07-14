# 📋 Preset Source Documentation

This document explains how to create and use preset sources for the Hosts Generator application.

## 🔍 Overview

Preset sources allow you to define collections of domain lists for **bypassing DNS pollution and censorship**. This is especially useful for:
- **Commonly blocked services** (Microsoft, GitHub, Google, etc.)
- **Regional restrictions** (Social media, gaming platforms)
- **Corporate firewalls** (Development tools, cloud services)
- **ISP censorship** (News sites, communication tools)
- **Gaming platforms** (Steam, Xbox Live, PlayStation Network)
- **Development tools** (GitHub, npm, Docker Hub)

## 📝 Schema Definition

Preset sources must be valid JSON files that conform to the following TypeScript interface:

```typescript
interface PresetItem {
  title: string;        // Display name for the preset
  value?: string | string[]; // Domain list content (string or array for better readability)
  children?: PresetItem[]; // Nested presets (max 1 level)
}

type PresetSource = PresetItem[];
```

## 🏗️ Structure Requirements

### Basic Rules
- **Root Level**: Array of `PresetItem` objects
- **Nesting**: Maximum 1 level of nesting allowed
- **Title**: Required for all items, used as display name
- **Value**: Optional for parent items, can be string or string array
- **Children**: Optional array of child presets

### Value Format Options
- **String format**: `"domain1.com\ndomain2.com\ndomain3.com"`
- **Array format**: `["domain1.com", "domain2.com", "domain3.com"]` (recommended for better readability)

### Validation
The application uses Zod schema validation with these rules:
- `title`: Must be a non-empty string
- `value`: Optional string or string array containing domains
- `children`: Optional array with maximum 1 level of nesting

## 📚 Examples

### Simple Preset List (Array Format - Recommended)

```json
[
  {
    "title": "Microsoft Services",
    "value": [
      "microsoft.com",
      "office.com",
      "outlook.com",
      "hotmail.com",
      "xbox.com",
      "teams.microsoft.com",
      "login.microsoftonline.com"
    ]
  },
  {
    "title": "GitHub & Development",
    "value": [
      "github.com",
      "github.io",
      "githubassets.com",
      "raw.githubusercontent.com",
      "api.github.com",
      "npm.js.org",
      "registry.npmjs.org"
    ]
  },
  {
    "title": "Google Services",
    "value": [
      "google.com",
      "gmail.com",
      "youtube.com",
      "googleapis.com",
      "gstatic.com",
      "google-analytics.com"
    ]
  }
]
```

### Simple Preset List (String Format - Still Supported)

```json
[
  {
    "title": "Microsoft Services",
    "value": "microsoft.com\noffice.com\noutlook.com\nhotmail.com\nxbox.com\nteams.microsoft.com\nlogin.microsoftonline.com"
  },
  {
    "title": "GitHub & Development",
    "value": "github.com\ngithub.io\ngithubassets.com\nraw.githubusercontent.com\napi.github.com\nnpm.js.org\nregistry.npmjs.org"
  }
]
```

### Nested Preset Structure

```json
[
  {
    "title": "Commonly Blocked Services",
    "children": [
      {
        "title": "Microsoft Ecosystem",
        "value": [
          "microsoft.com",
          "office.com",
          "outlook.com",
          "hotmail.com",
          "xbox.com",
          "teams.microsoft.com",
          "login.microsoftonline.com",
          "office365.com"
        ]
      },
      {
        "title": "Gaming Platforms",
        "value": [
          "steam.com",
          "steamcommunity.com",
          "steampowered.com",
          "epicgames.com",
          "xbox.com",
          "playstation.com",
          "ea.com"
        ]
      }
    ]
  },
  {
    "title": "Development Tools",
    "children": [
      {
        "title": "GitHub & Git Services",
        "value": [
          "github.com",
          "github.io",
          "githubassets.com",
          "raw.githubusercontent.com",
          "api.github.com",
          "gitlab.com"
        ]
      },
      {
        "title": "Package Managers & CDNs",
        "value": [
          "npmjs.org",
          "registry.npmjs.org",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "docker.com",
          "docker.io"
        ]
      }
    ]
  },
  {
    "title": "Communication Tools",
    "value": [
      "discord.com",
      "slack.com",
      "zoom.us",
      "teams.microsoft.com",
      "skype.com"
    ]
  }
]
```

## 🔧 Domain Format Support

The `value` field supports multiple domain formats:

### Plain Domains
```
example.com
subdomain.example.com
another-domain.org
```

### Hosts File Format
```
127.0.0.1 example.com
0.0.0.0 ads.example.com
192.168.1.1 local.dev
```

### Mixed Format
```
example.com
127.0.0.1 blocked.com
test.org
0.0.0.0 tracker.net
```

### Comments and Empty Lines
```
# This is a comment
example.com

# Another comment
test.org
```

## 🌐 Hosting Your Preset Source

### GitHub Pages
1. Create a public repository
2. Add your JSON file (e.g., `presets.json`)
3. Enable GitHub Pages
4. Use the raw file URL: `https://username.github.io/repo/presets.json`

### GitHub Raw Files
1. Upload your JSON file to any GitHub repository
2. Get the raw file URL: `https://raw.githubusercontent.com/username/repo/main/presets.json`

### CDN Services
- **jsDelivr**: `https://cdn.jsdelivr.net/gh/username/repo/presets.json`
- **Statically**: `https://cdn.statically.io/gh/username/repo/main/presets.json`

### Custom Server
Host on any web server with proper CORS headers:
```
Access-Control-Allow-Origin: *
Content-Type: application/json
```

## ⚙️ Configuration

### Adding Preset Source
1. Open the Hosts Generator application
2. Click the Settings (⚙️) icon in the header
3. Enter your preset source URL
4. Save settings

### Using Presets
1. In the input panel, click the preset dropdown
2. Browse categories and select a preset
3. The domains will be loaded into the input field
4. Click "Resolve Domains" to process

## ✅ Best Practices

### Performance
- **Keep files small**: Aim for under 100KB for fast loading
- **Use compression**: Enable gzip compression on your server
- **Cache appropriately**: Set reasonable cache headers

### Organization
- **Logical grouping**: Group related domains together
- **Clear naming**: Use descriptive titles for presets
- **Hierarchical structure**: Use nesting for better organization

### Content Quality
- **Valid domains**: Ensure all domains are properly formatted
- **Regular updates**: Keep domain lists current
- **Documentation**: Include comments explaining the purpose

### Security
- **HTTPS only**: Always use HTTPS URLs for preset sources
- **Trusted sources**: Only use presets from trusted providers
- **Regular review**: Periodically review and update preset sources

## 🚨 Common Issues

### CORS Errors
```
Access to fetch at 'https://example.com/presets.json' from origin 'https://yourdomain.com' has been blocked by CORS policy
```
**Solution**: Ensure your server sends proper CORS headers

### Invalid JSON
```
SyntaxError: Unexpected token } in JSON at position 123
```
**Solution**: Validate your JSON using a JSON validator

### Schema Validation Errors
```
Invalid preset format
```
**Solution**: Check that your JSON matches the required schema

### Network Errors
```
Failed to fetch presets: HTTP 404: Not Found
```
**Solution**: Verify the URL is correct and accessible

## 📊 Example Use Cases

### Microsoft Services (Commonly Blocked)
```json
[
  {
    "title": "Microsoft Services",
    "children": [
      {
        "title": "Office 365",
        "value": [
          "office.com",
          "office365.com",
          "outlook.com",
          "hotmail.com",
          "live.com",
          "login.microsoftonline.com"
        ]
      },
      {
        "title": "Xbox & Gaming",
        "value": [
          "xbox.com",
          "xboxlive.com",
          "accounts.xboxlive.com",
          "xsts.auth.xboxlive.com"
        ]
      },
      {
        "title": "Teams & Communication",
        "value": [
          "teams.microsoft.com",
          "teams.live.com",
          "config.teams.microsoft.com"
        ]
      }
    ]
  }
]
```

### GitHub & Development Tools
```json
[
  {
    "title": "GitHub Services",
    "value": [
      "github.com",
      "github.io",
      "githubassets.com",
      "raw.githubusercontent.com",
      "api.github.com",
      "registry.npmjs.org"
    ]
  }
]
```

### Gaming Platforms
```json
[
  {
    "title": "Gaming Platforms",
    "value": [
      "steam.com",
      "steamcommunity.com",
      "steampowered.com",
      "epicgames.com",
      "xbox.com",
      "playstation.com"
    ]
  }
]
```

## 🔍 Validation Tool

You can validate your preset JSON using this simple structure:

```typescript
import { z } from 'zod';

const PresetItemSchema: z.ZodType<PresetItem> = z.lazy(() =>
  z.object({
    title: z.string().min(1, 'Title is required'),
    value: z.union([z.string(), z.array(z.string())]).optional(), // Support both string and string array
    children: z.array(PresetItemSchema).max(1).optional(),
  })
);

const PresetListSchema = z.array(PresetItemSchema);

// Validate your preset data
const validatePresets = (data: unknown): PresetItem[] => {
  try {
    return PresetListSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid preset format');
  }
};
```

## 📚 Additional Resources

- [JSON Schema Validator](https://jsonschemavalidator.net/)
- [CORS Information](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [DNS over HTTPS Information](https://en.wikipedia.org/wiki/DNS_over_HTTPS)

## 🤝 Contributing

If you create useful preset sources, consider sharing them with the community:
1. Create a public repository with your presets
2. Add documentation explaining the purpose
3. Share the URL in the project discussions
4. Follow the schema and best practices outlined above

---

For questions or issues with preset sources, please visit the [GitHub Issues](https://github.com/alkinum/hosts-generator/issues) page.