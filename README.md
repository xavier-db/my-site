\# Adding New Content



\## Creating a New Magazine

1. Copy the `magazine-reference` folder.

2\. Paste it into the `/magazines` directory.

3\. Rename the folder to the title of the new magazine.



Example:



```txt

/magzines/My New Magazine

```



\---



\## Editing Magazine Information



Inside the new magazine folder:



1\. Open `description.txt`

2\. Edit the information following the comments inside the file.

3\. Add a background image if wanted.



Example structure:



```txt

/magazines

&#x20;   /my-new-magazine

&#x20;       /art

&#x20;       /music

&#x20;       /photography

&#x20;       /writing

&#x20;       description.txt

&#x20;       background.png

```



\---



\## Adding Posts / Articles



Each category folder can contain posts:



\- `art`

\- `music`

\- `photography`

\- `writing`



To create a new post:



1\. Open the category folder.

2\. Create a new folder.

3\. Name the folder the title of the post.



Example:



```txt

/art/my-article-title

```



\---



\## Adding Content to a Post



Inside the post folder, you can add:



\- Images

\- Videos

\- `description.txt`

\- Other media/files related to the article



Example:



```txt

/art/my-article-title

&#x20;   image1.png

&#x20;   image2.jpg

&#x20;   video.mp4

&#x20;   description.txt

```



\---



\## Full Example Structure



```txt

/my-site

&#x20;   /magazines

&#x20;       /my-new-magazine

&#x20;           /art

&#x20;               /my-article-title

&#x20;                   image1.png

&#x20;                   description.txt



&#x20;           /music

&#x20;           /photography

&#x20;           /writing



&#x20;           description.txt

&#x20;           background.png

```



\---



\## Notes



\- Folder names become article titles.

\- `description.txt` files are used for written content and metadata.

\- Images and videos placed inside article folders will automatically be available to the site.

