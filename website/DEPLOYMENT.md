# PiggySave Website - Netlify Deployment Guide

This guide will help you deploy the PiggySave demo website to Netlify in just a few minutes.

## 🚀 Deployment Options

### Option 1: Netlify CLI (Recommended for Quick Deploy)

The Netlify CLI is already installed and ready to use!

#### Step 1: Authenticate with Netlify

```bash
cd website
netlify login
```

This will open your browser to authenticate with Netlify. If you don't have a Netlify account:
1. Go to [netlify.com](https://netlify.com)
2. Sign up for free (GitHub, GitLab, or email)
3. Come back and run `netlify login` again

#### Step 2: Deploy the Site

**For a draft deployment (to test first):**
```bash
netlify deploy
```
- When prompted, choose "Create & configure a new site"
- Select your team
- Enter a site name (e.g., `piggysave-demo`)
- Publish directory: Enter `.` (current directory)

**For production deployment:**
```bash
netlify deploy --prod
```

That's it! Your site will be live at: `https://your-site-name.netlify.app`

---

### Option 2: Netlify Drag & Drop (Easiest - No CLI Required)

Perfect if you want the simplest deployment!

#### Steps:

1. **Go to Netlify Drop**: [app.netlify.com/drop](https://app.netlify.com/drop)

2. **Drag the `website` folder** onto the page (or click to browse)

3. **Wait for upload** - Takes 10-30 seconds

4. **Done!** Your site is live at a random URL like `https://random-name-123.netlify.app`

5. **Optional**: Click "Site settings" → "Change site name" to customize the URL

---

### Option 3: Connect to Git Repository (Best for Continuous Deployment)

This option automatically redeploys when you push changes to GitHub.

#### Steps:

1. **Push your code to GitHub** (already done!)

2. **Go to Netlify**: [app.netlify.com](https://app.netlify.com)

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to GitHub** and select your repository: `VJMallina/claudeRepo`

5. **Configure build settings:**
   - **Base directory**: `website`
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (or leave empty, it will auto-detect from netlify.toml)

6. **Click "Deploy site"**

7. **Done!** Site will be live in 1-2 minutes

Every time you push changes to the branch, Netlify will automatically redeploy!

---

## 🎨 Customizing Your Deployment

### Custom Domain

After deployment, you can add a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `piggysave.com`)
4. Follow DNS configuration instructions
5. Free SSL certificate will be automatically provisioned

### Environment Variables

If you need to add environment variables later:

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add key-value pairs

### Build Settings

The `netlify.toml` file already contains optimal configuration:
- Security headers
- Cache control for static assets
- Pretty URLs
- Redirect rules

You can modify this file to customize further.

---

## 📊 Post-Deployment Checklist

After deployment, verify:

- [ ] Website loads correctly at the Netlify URL
- [ ] All navigation links work
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Smooth scrolling functions properly
- [ ] Interactive features work (hover effects, animations)
- [ ] Forms are working (if any)
- [ ] Mobile menu toggles correctly

---

## 🌐 Your Live URLs

After deployment, you'll have:

- **Default Netlify URL**: `https://[site-name].netlify.app`
- **Deploy preview URLs**: For each branch/PR (if using Git)
- **Custom domain**: (if configured)

---

## 🔧 Troubleshooting

### Issue: Site shows 404

**Solution**: Make sure the publish directory is set to `.` or the root of the website folder.

### Issue: CSS/JS not loading

**Solution**: Check that paths in `index.html` are relative (not absolute). They should be:
- `css/style.css` ✅ (not `/css/style.css`)
- `js/script.js` ✅ (not `/js/script.js`)

### Issue: Build fails

**Solution**: Since this is a static site with no build process, make sure "Build command" is empty.

---

## 🎯 Quick Commands Reference

```bash
# Login to Netlify
netlify login

# Deploy to draft URL (for testing)
netlify deploy

# Deploy to production
netlify deploy --prod

# Open deployed site in browser
netlify open:site

# Check deployment status
netlify status

# View site logs
netlify logs

# Link to existing site
netlify link
```

---

## 📈 Analytics & Monitoring

Netlify provides built-in analytics:

1. Go to your site dashboard
2. Click **Analytics** tab
3. Enable Netlify Analytics ($9/month) or integrate free alternatives:
   - Google Analytics
   - Plausible
   - Fathom

---

## 🚀 Performance Tips

Your site is already optimized, but you can further improve:

1. **Enable HTTP/2 Server Push**: Already configured in headers
2. **Add Service Worker**: For offline support
3. **Optimize Images**: Use WebP format (when you add real images)
4. **Enable Netlify Edge**: For faster global delivery
5. **Pre-render Pages**: Already a static site, so this is done!

---

## 🔒 Security

Netlify automatically provides:

- ✅ Free SSL certificate (HTTPS)
- ✅ DDoS protection
- ✅ CDN delivery
- ✅ Security headers (configured in netlify.toml)

---

## 💡 Next Steps

After deployment:

1. **Share the URL** with your team/stakeholders
2. **Test on multiple devices** and browsers
3. **Add Google Analytics** (if needed)
4. **Configure custom domain** (if you have one)
5. **Set up form handling** (if you add contact forms)
6. **Enable branch deploys** for preview environments

---

## 📞 Support

Need help?

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [answers.netlify.com](https://answers.netlify.com)
- **Status**: [netlifystatus.com](https://netlifystatus.com)

---

## 🎉 You're All Set!

Your PiggySave demo website is production-ready and optimized for Netlify deployment. Choose any of the three options above and you'll be live in minutes!

**Estimated deployment time**: 2-5 minutes ⚡

---

**Made with ❤️ for PiggySave** 🐷
