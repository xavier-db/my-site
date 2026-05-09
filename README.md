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
/art/my-article-title
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
/art/my-article-title
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
        /my-new-magazine
            /art
                /my-article-title
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
