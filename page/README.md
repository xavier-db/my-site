# Adding New Content

## Creating a New Magazine

1. Copy the `magazine-reference` folder.
2. Paste it into the `/magazines` directory.
3. Rename the copied folder to the title of the new magazine.

Example:

```txt
/magazines/My New Magazine **(Replace with your own magazine name)**
```

---

## Editing Magazine Information

Inside the new magazine folder:

1. Open `description.txt`
2. Edit the information following the comments inside the file.
3. Add a background image if wanted.

Example structure:

```txt
/magazines
    /My New Magazine **(Replace with your own magazine name)**
        /art
        /music
        /photography
        /writing
        description.txt
        background.png
```

---

## Adding Posts / Articles

Each category folder can contain posts:

- `art`
- `music`
- `photography`
- `writing`

To create a new post:

1. Open the category folder.
2. Create a new folder.
3. Name the folder the title of the post.

Example:

```txt
/art/My Article Title **(Replace with your own article title)**
```

---

## Adding Content to a Post

Inside the post folder, you can add:

- Images
- Videos
- `description.txt`
- Other media/files related to the article

Example:

```txt
/art/My Article Title **(Replace with your own article title)**
    image1.png
    image2.jpg
    video.mp4
    description.txt
```

---

## Full Example Structure

```txt
/my-site
    /magazines
        /My New Magazine **(Replace with your own magazine name)**
            /art
                /My Article Title **(Replace with your own article title)**
                    image1.png
                    description.txt

            /music
            /photography
            /writing

            description.txt
            background.png
```

---

## Notes

- Folder names become article titles.
- `description.txt` files are used for written content and metadata.
- Images and videos placed inside article folders will automatically be available to the site.
