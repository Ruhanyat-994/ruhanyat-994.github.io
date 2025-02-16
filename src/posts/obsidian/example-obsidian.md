---
title: Example CTF Walkthrough
date: 2024-03-15
author: Mian Al Ruhanyat
tags: [ctf, beginner, walkthrough]
---

# Sync your github with obsidian

### Prerequisites 

- Download obsidian and git in your device
- Sign-in your github in your browser
- Connect your github with your machines git

## Obsidian Pluggins


1. Create a Vault similar to the repo you want to Edit
2. Download `Git` Plugin from the Community Plugins

![](Photos/deba5f8343f9b2b35d6ba9bb9ba711d0_MD5.jpeg)
3. Then go to the terminal and go to the directory where you saved the vault and run the below commands
## **Step 1: Initialize the Local Repository**
I started by navigating to my project directory and initializing a new Git repository:

```bash
cd CPTS
git init
```



## **Step 2: Add and Commit Local Files**
Next, I added all the files in the directory to the staging area and committed them:

```bash
git add .
git commit -m "new workspace in kali"
```



## **Step 3: Link the Local Repository to the Remote Repository**
I linked my local repository to the remote GitHub repository using the `git remote add` command:

```bash
git remote add origin git@github.com:Ruhanyat-994/CPTS.git
```



## **Step 4: Pull Changes from the Remote Repository**
When I tried to pull changes from the remote repository, I encountered an error due to unrelated histories:

```bash
git pull origin master
```

The error message was:
```
fatal: refusing to merge unrelated histories
```


## **Step 5: Allow Unrelated Histories**
To resolve the issue, I used the `--allow-unrelated-histories` flag to force Git to merge the unrelated histories:

```bash
git pull origin master --allow-unrelated-histories
```

After resolving any merge conflicts, I staged the changes and committed them:

```bash
git add .
git commit -m "Merge unrelated histories"
```



## **Step 6: Fetch and Pull Again**
I fetched the latest changes from the remote repository and pulled them into my local branch:

```bash
git fetch origin master
git pull origin master
```



## **Step 7: Push Local Changes to the Remote Repository**
Finally, I pushed my local changes to the remote repository:

```bash
git push -u origin master
```



## **Step 8: Verify the Status**
To ensure everything was in sync, I checked the status of my repository:

```bash
git status
```


## **Summary of Commands**
Here’s a summary of all the commands I used:

```bash
cd CPTS
git init
git add .
git commit -m "new workspace in kali"
git remote add origin git@github.com:Ruhanyat-994/CPTS.git
git pull origin master --allow-unrelated-histories
git add .
git commit -m "Merge unrelated histories"
git fetch origin master
git pull origin master
git push -u origin master
git status
```

---

4. Then go to your obsidian vault make some changes press `ctrl`+`p`  and type `sync`  and hit enter .
5. It will automatically push all the changes to the repository in github