# Adding new plants to your Plot 47 app — a step-by-step guide

Keep this guide somewhere handy. It explains exactly what to do with a
**plant file** — the file Claude gives you (its name ends in `.json`) when you
ask for new plants for your app. You'll follow the same steps every time, so
this is written as a reference you can come back to.

**The short version:** save the file to your phone, open the app from your
home screen, go to Settings, tap *Import backup*, and pick the file. The new
plants appear in your Database tab. That's it — the rest of this guide just
walks through each step carefully.

---

## Before you start — two things worth knowing

**1. Everything the app knows is stored on your phone.**
Your map, your journal, and your plant list all live inside the app on the
phone you use it on. So the import has to happen *on that phone* — importing
the file on a computer, or on a different device, won't change the app on
your phone.

**2. Importing is safe.**
The plant file only contains plants. Bringing it in *adds to* your plant list —
it cannot delete your map, your pins, or your journal notes. If you import the
same file twice by mistake, nothing bad happens; the app just says "already
got these" internally and moves on.

---

## Step 1 — Save the file Claude gives you

Claude will hand you a file with a name like `plot47-plants-herbs.json`.

**If you're chatting with Claude on your phone** (the easy way):
1. Tap the file in the chat.
2. Choose **Save to Files** (iPhone) or **Download** (Android).
3. Remember where it went — "On My iPhone" or the "Downloads" folder is fine.

**If you're chatting with Claude on a computer:**
1. Download the file to the computer.
2. Get it to your phone however you normally move things:
   - email it to yourself and open the email on your phone, or
   - AirDrop it (iPhone ↔ Mac), or
   - put it in Google Drive / iCloud and open that app on your phone.
3. Save it to your phone's Files or Downloads, same as above.

The file is just text — it doesn't need to be opened, and there's no need to
look inside it. If you do open it by accident, don't change anything; just
close it without saving.

---

## Step 2 — Make a safety copy of your app (30 seconds, worth it)

Not strictly required, but a good habit before any import:

1. Open **Plot 47** from your home screen.
2. Tap the small **gear** (⚙) in the top-right corner.
3. Tap **Export backup**.
4. Your phone saves a file — that's a complete copy of everything in your app
   as it is right now. Tuck it away in Files or Drive.

If anything ever goes wrong — lost phone, cleared browser, gremlins — you can
bring your whole allotment back by importing that backup file with the same
Import button you're about to use.

---

## Step 3 — Import the plant file

1. Open **Plot 47** — **always from its icon on your home screen**, not by
   typing the address into Safari or Chrome. (The home-screen version and the
   browser version keep separate copies of your data, so make sure you're in
   the one you actually use.)
2. Tap the **gear** (⚙) in the top-right corner.
3. Under **Backup — file**, tap **Import backup**.
4. Your phone's file picker opens. Find the plant file you saved in Step 1
   and tap it.
5. Wait a moment. You'll see a message like:
   > *Backup imported — newest version of each record kept.*
6. Tap **Done** to close Settings.

---

## Step 4 — Check the new plants arrived

1. Tap the **Database** tab at the bottom of the screen.
2. Scroll to the bottom. Your new plants appear in a section called
   **My plants**.
3. Tap one to see its full page — sowing and harvest times, care notes,
   companion plants, pests and what to do about them.

If Claude *updated* one of the app's built-in plants rather than adding a new
one, look for it in its usual place in the list (Vegetables or Flowers) — the
page will simply show the new information.

---

## Step 5 — Put the new plants on your map (whenever you like)

1. Go to the **Map** tab.
2. Tap **Build** at the top.
3. In the panel at the bottom, scroll the plant buttons along — your new
   plants are there under **My plants**.
4. Tap the plant you want, then tap the spot on the map where it's growing.
5. Drag the pin to nudge it; pinch it (or use the size slider) to match how
   much space the real plant takes.
6. Tap **View** at the top when you're finished.

---

## If something doesn't look right

**"Import failed: Not a Plot 47 backup file."**
The file got altered or the wrong file was picked. Don't try to fix the file
yourself — go back to Claude, say the import failed, and ask it to generate
the file again. Then repeat from Step 1 with the fresh file.

**The import said it worked, but I can't see the plants.**
- Check the very bottom of the Database tab — the **My plants** section is
  below the flowers.
- Make sure you did the import inside the app you actually use — opened from
  the home-screen icon, on your own phone.

**I imported the same file twice.**
No harm done. The app recognises the plants and keeps one copy of each.

**I want to remove a plant I added.**
Ask Claude for a small "removal" file naming the plant — importing it takes
that plant out of your list. (Any pins of it on your map you can delete
yourself in Build mode with *Remove selected pin*.)

---

## Keeping things tidy for the future

- **Keep the plant files.** Save them in a folder in Files, Drive, or iCloud
  called something like *Plot 47 plants*. If you ever set the app up on a new
  phone, import your latest **Export backup** first, and you're back exactly
  where you left off.
- **Asking Claude for more plants later:** point it at the instruction file in
  your project — `docs/PLANT_PACK_GUIDE.md` — and list the plants you want,
  e.g. *"Read the plant pack guide in my allotmentapp project and make me a
  plant file with rhubarb, garlic and sweet william."* Then come back to this
  guide and repeat the steps.
- **Export a backup now and then** (Step 2), especially after a busy spell of
  journalling or replanning the map. One tap, and everything's safe.
