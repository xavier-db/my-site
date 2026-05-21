# Elysian: To Be Seen — Content Guide

## The Reference Folder

There's a folder called `magazine-reference (DO NOT DELETE)` inside `/magazines`. This is your **template**. When you want to create a new magazine issue, copy this folder and rename the copy. **Do not delete or rename the original.**

---

## Adding a New Magazine Issue

1. Copy the `magazine-reference (DO NOT DELETE)` folder.
2. Paste it into `/magazines`.
3. Rename the copy to your magazine's title (e.g. `Issue 3 - New Horizons`).
4. Open `description.txt` in the root of your new folder and replace the placeholder text with a short description of the issue.
5. Replace `example-picture-REPLACE-THIS.png` with your own background image.

Your new issue folder should look like this:

```
/magazines
    /Issue 3 - New Horizons
        /Art
        /Music
        /Photography
        /Writing
        description.txt          ← Issue description (plain text)
        example-picture-REPLACE-THIS.png   ← Background image (replace with your own)
        index.html               ← Don't edit this
```

---

## Adding a Post

Posts go inside one of the four category folders (`Art`, `Music`, `Photography`, `Writing`).

1. Open the category folder you want to post in.
2. Create a new folder — the **folder name becomes the post title**.
3. Inside that folder, add your content:
   - `description.txt` — A plain text file with the post's written content or description.
   - Images (`.png`, `.jpg`, `.jpeg`, etc.)
   - Videos (`.mp4`, etc.)
   - Audio (`.mp3`, `.flac`, `.wav`, etc.)

Example:

```
/Art
    /Melt
        description.txt
        image1.png
        image2.jpg
```

This creates a post titled **"Melt"** in the Art section.

---

## Adding a New Staff's Works Page

1. Copy an existing person's folder.
2. Inside that folder, replace with your own content:
    - `description.txt` — A plain text file with the post's written content or description.
    - Images (`.png`, `.jpg`, `.jpeg`, etc.)
    - Videos (`.mp4`, etc.)
    - Audio (`.mp3`, `.flac`, `.wav`, etc.)
3. Rename the image you want to become the cover as `cover` - e.g. `cover.png`, `cover.JPEG`.

Example:

```
/staffs-work
    /Person 1
        description.txt
        cover.png
        index.html ← Don't edit this
```

---

## Category Descriptions

Each category folder also has its own `description.txt` at the root level (not inside a post folder). This describes the category itself — e.g. what the Art or Music section is about for that issue. Edit these to fit each magazine issue if needed.

```
/Art
    description.txt       ← Describes the Art section
    /Melt
        description.txt   ← Describes the "Melt" post
```

---

## Full Example

```
/magazines
    /magazine-reference (DO NOT DELETE)    ← Template, don't touch
    /Issue 1 - To Be Seen
        description.txt                   ← "The very first issue of..."
        background.png                    ← Issue background image
        index.html

        /Art
            description.txt               ← "Exploring new perspectives in..."
            /Melt
                description.txt           ← Post description
                image1.png

        /Music
            description.txt
            /Track Name
                description.txt

        /Photography
            description.txt
            /Photo Set Name
                description.txt
                img1.png
                img2.png

        /Writing
            description.txt
            /Essay Title
                description.txt
                cover.jpg
```

---

## Quick Reference

| What you want to do | How to do it |
|---|---|
| Create a new magazine issue | Copy the reference folder, rename it |
| Set the issue description | Edit `description.txt` in the issue root |
| Set the issue background | Replace the `.png` image in the issue root |
| Add a post | Create a folder inside a category, name it your title |
| Add post content | Drop `description.txt`, images, and media into the post folder |
| Edit a category description | Edit the `description.txt` at the category root level |

---

## Things to Keep In Mind

- **Folder names = titles.** Whatever you name a folder is what shows up on the site, so name them how you want them displayed.
- **`description.txt` = plain text.** Just write in it directly, no special formatting.
- **Don't edit `index.html`** inside magazine folders unless you know what you're doing, these are used as a template.
- **Don't delete the magazine reference folder.**
- **Categories can be added and removed.** The four categories (`Art`, `Music`, `Photography`, `Writing`) can either be deleted if you don't want them in each magazine or can have new categories added.