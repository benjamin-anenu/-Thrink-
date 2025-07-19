# 🤖 AI Service Integration Guide

## Overview

Your application now supports **real AI integration** with multiple providers including OpenAI and Anthropic Claude. You can choose between **direct API integration** (for development) or **Supabase Edge Functions** (recommended for production).

## 🚀 Quick Start (5 minutes)

### Option 1: OpenAI Integration (Recommended)

1. **Get an OpenAI API Key**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new secret key
   - Copy the key (starts with `sk-`)

2. **Configure Your Environment**
   ```bash
   # Create/edit .env.local file
   echo "VITE_OPENAI_API_KEY=your_actual_api_key_here" >> .env.local
   echo "VITE_AI_SERVICE_PROVIDER=openai" >> .env.local
   echo "VITE_AI_MODEL=gpt-4o-mini" >> .env.local
   echo "VITE_USE_EDGE_FUNCTIONS=false" >> .env.local
   ```

3. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

4. **Test the Connection**
   - Go to Dashboard → AI Insights tab
   - You'll see an "AI Service Status" card
   - Click "Test Connection" to verify it's working

### Option 2: Anthropic Claude Integration

1. **Get an Anthropic API Key**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Create an API key
   - Copy the key (starts with `sk-ant-`)

2. **Configure Your Environment**
   ```bash
   # Edit .env.local file
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   VITE_AI_SERVICE_PROVIDER=anthropic
   VITE_AI_MODEL=claude-3-sonnet-20240229
   VITE_USE_EDGE_FUNCTIONS=false
   ```

## 🏗️ Integration Architecture

### Current AI Features

✅ **Project Plan Generation**: AI creates comprehensive project plans  
✅ **Risk Assessment**: Automated risk analysis and mitigation strategies  
✅ **Task Suggestions**: AI-powered task breakdown and estimation  
✅ **Real-time Insights**: Dynamic insights based on project metrics  
✅ **Resource Optimization**: AI recommendations for team allocation  

### Data Flow

```
Project Data → AI Service → Generated Content → Stored in Supabase → Displayed in UI
     ↓              ↓              ↓                    ↓               ↓
User Input → OpenAI/Claude → AI Response → Database → Dashboard Insights
```

## 🔒 Production Setup (Supabase Edge Functions)

For production, use Edge Functions to keep API keys secure on the server:

### 1. Deploy Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the AI completion function
supabase functions deploy ai-completion
```

### 2. Set Environment Variables in Supabase

Go to your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → Edge Functions:

```
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=openai
```

### 3. Update Your App Configuration

```bash
# Edit .env.local
VITE_USE_EDGE_FUNCTIONS=true
# Remove VITE_OPENAI_API_KEY (now handled server-side)
```

## 📊 Available AI Features

### 1. Project Creation AI
- **Location**: Project Creation Wizard
- **Function**: Generates project plans, risk assessments, task suggestions
- **Triggers**: When creating new projects

### 2. Dashboard AI Insights
- **Location**: Dashboard → AI Insights tab
- **Function**: Real-time analysis of project metrics
- **Triggers**: Every 2 seconds when data changes

### 3. AI Project Analysis
- **Location**: Individual project pages
- **Function**: Project-specific insights and recommendations
- **Triggers**: When viewing project details

## ⚙️ Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key | - | Yes (for OpenAI) |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key | - | Yes (for Claude) |
| `VITE_AI_SERVICE_PROVIDER` | AI provider (openai/anthropic) | openai | No |
| `VITE_AI_MODEL` | AI model to use | gpt-4o-mini | No |
| `VITE_USE_EDGE_FUNCTIONS` | Use Supabase Edge Functions | false | No |

### Recommended Models

**OpenAI Models:**
- `gpt-4o-mini` - Fast, cost-effective (recommended)
- `gpt-4o` - More capable, higher cost
- `gpt-3.5-turbo` - Fastest, lowest cost

**Anthropic Models:**
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fast and efficient
- `claude-3-opus-20240229` - Most capable

## 🔧 Troubleshooting

### Common Issues

1. **"AI service is not configured"**
   - Check your `.env.local` file has the correct API key
   - Restart your development server
   - Verify the API key is valid

2. **"AI generation failed"**
   - Check your API key permissions
   - Verify you have API credits/usage available
   - Check network connectivity

3. **"No content in AI response"**
   - The AI model may be experiencing issues
   - Try a different model
   - Check the AI provider status page

### Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
VITE_DEBUG_AI=true
```

### Test Connection

Use the AI Configuration Status component to test your setup:

1. Go to Dashboard → AI Insights
2. Look for "AI Service Status" card
3. Click "Test Connection"
4. Review the response and usage statistics

## 💰 Cost Considerations

### OpenAI Pricing (Approximate)
- **GPT-4o-mini**: $0.15/1M input tokens, $0.60/1M output tokens
- **GPT-4o**: $5.00/1M input tokens, $15.00/1M output tokens

### Anthropic Pricing (Approximate)
- **Claude 3 Sonnet**: $3.00/1M input tokens, $15.00/1M output tokens
- **Claude 3 Haiku**: $0.25/1M input tokens, $1.25/1M output tokens

### Cost Optimization Tips

1. **Use smaller models** for simple tasks (gpt-4o-mini, claude-3-haiku)
2. **Cache AI responses** in your database (already implemented)
3. **Set usage limits** in your AI provider dashboard
4. **Monitor token usage** via the debug interface

## 🔄 Fallback Behavior

The application gracefully handles AI failures:

1. **No API Key**: Shows configuration prompts, uses rule-based insights
2. **API Errors**: Falls back to simulated responses with realistic content
3. **Network Issues**: Uses cached responses when available
4. **Rate Limits**: Implements retry logic with exponential backoff

## 📈 Monitoring AI Usage

### Built-in Monitoring

- **Token Usage**: Displayed in AI status component
- **Response Time**: Logged in browser console
- **Error Rates**: Tracked and displayed in debug mode
- **Success Rates**: Shown in connection tests

### External Monitoring

Set up monitoring in your AI provider dashboard:

1. **OpenAI**: Monitor usage at [OpenAI Usage](https://platform.openai.com/usage)
2. **Anthropic**: Check usage at [Anthropic Console](https://console.anthropic.com/)

## 🚀 Next Steps

1. **Test the basic integration** with your API key
2. **Deploy to production** using Edge Functions
3. **Monitor usage** and adjust models as needed
4. **Customize prompts** for your specific use cases
5. **Add more AI features** using the established patterns

## 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify your API key in the provider dashboard
3. Test with a minimal example using the "Test Connection" feature
4. Review the AI service status and configuration

---

**Your AI integration is now complete!** 🎉

The application will automatically use AI when configured, and fall back to intelligent simulations when not configured, ensuring a smooth user experience regardless of setup status.