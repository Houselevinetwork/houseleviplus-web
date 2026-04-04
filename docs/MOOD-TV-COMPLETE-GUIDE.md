#  MOOD TV COMPLETE SETUP GUIDE

## What is Mood TV?

Mood TV is a 24/7 linear channel that plays different content at different times, like a real TV station.

**Example Schedule:**
- 6 AM - 10 AM: Coffee Jazz
- 10 AM - 12 PM: DJ RNB Mix
- 12 PM - 2 PM: Sisibo Podcast
- 2 PM - 4 PM: East Africa Music
- 4 PM - 7 PM: Rhumba & Country
- 7 PM - 10 PM: Fireplace 4K
- 10 PM - 3 AM: Rainfall
- 3 AM - 6 AM: Morning Glory DJ

---

## Architecture (How It Works)

\\\
YOU (Admin)
    
MongoDB (Store schedule)
    
NestJS API (Serve schedule)
    
OBS Studio (On VPS - Plays videos)
    
Cloudflare Stream Live (Receives video)
    
Cloudflare CDN (Distributes globally)
    
100,000 USERS (Watch on phones/web/TV)
\\\

---

## Cost Breakdown

### Your Truehost VPS
- **Cost:** \-40/month
- **What it does:** Runs OBS Studio 24/7
- **Handles:** Encoding 1 video stream

### Cloudflare Stream
- **Cost:** \ per 1,000 minutes delivered
- **What it does:** Distributes to unlimited viewers
- **Handles:** 100,000+ concurrent users

### Example for 100,000 Users:
- 100,000 users × 1 hour/day = 6,000,000 minutes/day
- Cost: \,000/day = \,000/month

### Cost Optimization:
1. Start with 720p (50% cheaper)
2. Free users = 30 min/day limit
3. Premium users = \.99/month unlimited

---

## Step-by-Step Setup

### STEP 1: Set Up Cloudflare Stream Live (15 minutes)

1. Go to Cloudflare Dashboard
2. Click **Stream**  **Live Inputs**
3. Click **Create Live Input**
4. Name it: "House Levi Mood TV"
5. Copy these 2 things:
   - **RTMP URL:** \tmps://live.cloudflare.com/live/...\
   - **Stream Key:** \MTQ0NTY3ODkw...\

6. Save the **Playback URL** (this is what users will watch):
   - Format: \https://customer-[ID].cloudflarestream.com/[INPUT_ID]/manifest/video.m3u8\

---

### STEP 2: Set Up Your VPS (30 minutes)

1. **Log into your Truehost VPS**
   \\\ash
   ssh root@your-vps-ip
   \\\

2. **Install OBS Studio**
   
   For Ubuntu:
   \\\ash
   sudo apt update
   sudo apt install obs-studio -y
   \\\

3. **Verify installation**
   \\\ash
   obs --version
   \\\

---

### STEP 3: Configure OBS (1 hour)

1. **Open OBS** (if on Ubuntu with GUI, or use OBS on your local machine to configure)

2. **Go to Settings  Stream**
   - Service: **Custom**
   - Server: [Paste your RTMP URL]
   - Stream Key: [Paste your Stream Key]

3. **Go to Settings  Output**
   - Output Mode: **Advanced**
   - Encoder: **x264** (CPU)
   - Rate Control: **CBR**
   - Bitrate: **3000** Kbps (for 720p)
   - Keyframe Interval: **2** seconds

4. **Go to Settings  Video**
   - Base Resolution: **1920x1080**
   - Output Resolution: **1280x720** (for lower costs)
   - FPS: **30**

---

### STEP 4: Create Scenes (1 hour)

For each time block, create a scene:

**Scene 1: Coffee Jazz (6 AM - 10 AM)**
1. Click **+ Add Scene**
2. Name: "Coffee Jazz"
3. Click **+ Add Source**  **Media Source**
4. Name: "Coffee Jazz Video"
5. Browse to your video file (or enter Cloudflare Stream URL)
6. Check:  **Loop**
7. Check:  **Restart playback when source becomes active**

**Repeat for all 8 scenes:**
- Scene 2: DJ RNB Mix
- Scene 3: Sisibo Podcast
- Scene 4: East Africa Music
- Scene 5: Rhumba & Country
- Scene 6: Fireplace 4K
- Scene 7: Rainfall
- Scene 8: Morning Glory DJ

---

### STEP 5: Automate Scene Switching (30 minutes)

**Option A: Advanced Scene Switcher Plugin (Recommended)**

1. Download from: https://github.com/WarmUpTill/SceneSwitcher
2. Install the plugin
3. Open OBS  **Tools**  **Advanced Scene Switcher**
4. Add time conditions:

\\\
Time: 06:00  Switch to: Coffee Jazz
Time: 10:00  Switch to: DJ RNB Mix
Time: 12:00  Switch to: Sisibo Podcast
Time: 14:00  Switch to: East Africa Music
Time: 16:00  Switch to: Rhumba & Country
Time: 19:00  Switch to: Fireplace 4K
Time: 22:00  Switch to: Rainfall
Time: 03:00  Switch to: Morning Glory DJ
\\\

---

### STEP 6: Start Streaming (5 minutes)

1. Click **Start Streaming** in OBS
2. Check Cloudflare Dashboard:
   - Stream  Live Inputs  Your input should show " Live"
3. Copy the playback URL
4. Test it in VLC player or web browser

---

### STEP 7: Add to Your App (30 minutes)

Add this to your Next.js app:

\\\	sx
// app/mood-tv/page.tsx

export default function MoodTVPage() {
  return (
    <div className="mood-tv-container">
      <h1>Mood TV</h1>
      
      {/* Cloudflare Stream Player */}
      <iframe
        src="https://customer-[YOUR_ID].cloudflarestream.com/[INPUT_ID]/iframe"
        style={{ width: '100%', height: '500px', border: 'none' }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      <p>Now playing: Check the schedule below</p>
    </div>
  );
}
\\\

---

## Monitoring & Maintenance

### Auto-Restart OBS (Linux)

Create a systemd service:

\\\ash
sudo nano /etc/systemd/system/obs.service
\\\

Content:
\\\ini
[Unit]
Description=OBS Studio for Mood TV
After=network.target

[Service]
User=your-username
ExecStart=/usr/bin/obs --startstreaming
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
\\\

Enable and start:
\\\ash
sudo systemctl enable obs
sudo systemctl start obs
sudo systemctl status obs
\\\

---

## Troubleshooting

### Stream Not Showing
-  Check RTMP URL and Stream Key are correct
-  Check firewall allows port 1935 (RTMP)
-  Check OBS logs: Help  Log Files

### Stream Keeps Dropping
-  Reduce bitrate to 2000 Kbps
-  Check VPS CPU usage (\	op\ command)
-  Verify stable internet connection

### Poor Video Quality
-  Increase bitrate (but not above VPS upload speed)
-  Change encoder to NVENC (if GPU available)
-  Increase output resolution

---

## Next Steps

1.  Complete this setup
2.  Test for 24 hours
3.  Add EPG (Electronic Program Guide) to your app
4.  Set up stream health monitoring
5.  Launch to users!

---

**Need help?** Check the packages:
- \@houselevi/linear-tv\ - Scheduling logic
- \@houselevi/live-streaming\ - Cloudflare integration
