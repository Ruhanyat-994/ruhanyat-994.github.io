---
title: "Elasticsearch, Logstash, Kibana step by step setup guide on AWS EC2"
date: 2026-02-9 01:19:00 +0600
categories: [Monitoring, Log, ELK]
tags: [ELK, Cloud, Monitoring, DevOps, Log, Elasticsearch, Kibana, Logstash]
image:
  path: /assets/posts/elk.png
  alt: ELK Architecture 
---

<figure style="max-width:720px; margin:0 auto; text-align:center;">
  <img src="../assets/Images/elk.png"
       alt="ELK"
       style="width:100%; max-width:720px; display:block; margin:0 auto;
              border-radius:18px; box-shadow:0 8px 24px rgba(0,0,0,0.12);
              border:1px solid rgba(0,0,0,0.06); object-fit:cover;" />
  <figcaption style="font-size:0.9rem; color:var(--text-muted,#666); margin-top:8px;">
    Fig: ELK
  </figcaption>
</figure>

## Architecture Summary

* **ELK Server (3.100.10.10)**
  Runs:

  * Elasticsearch (Port 9200)
  * Logstash (Port 5044)
  * Kibana (Port 5601)

* **Python Application Server (3.101.20.20)**
  Runs:

  * Python application on port `8080`
  * Filebeat (ships logs to Logstash)

* Log flow:

  ```
  Python App → app.log → Filebeat → Logstash → Elasticsearch → Kibana
  ```

## Security Group Requirements (ELK Server)

Configure inbound rules on the **ELK Server Security Group** as follows:

| Port   | Service                | Source                                    | Purpose                    |
| ------ | ---------------------- | ----------------------------------------- | -------------------------- |
| `9200` | Elasticsearch          | ELK server itself or restricted admin IP  | API access / testing       |
| `5044` | Logstash (Beats input) | `172.31.10.0/24` or App Server Private IP | Receive logs from Filebeat |
| `5601` | Kibana                 | Your public IP only                       | Web dashboard access       |



# 1. ELK SERVER SETUP

Run all commands on the ELK Server (3.100.10.10)


## 1. Add Elastic APT Repository

```bash
sudo apt update -y
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | \
sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update -y
```


# 2. Install and Configure Elasticsearch



## 2.1 Install Elasticsearch

```bash
sudo apt install elasticsearch -y
```
## 2.2 Configure Elasticsearch

```bash
sudo nano /etc/elasticsearch/elasticsearch.yml
```

Modify or add:

```yaml
cluster.name: elk-cluster
node.name: elk-node-1
network.host: 0.0.0.0
discovery.type: single-node
```
## 2.3 Start and Enable Elasticsearch

```bash
sudo systemctl daemon-reload
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
sudo systemctl status elasticsearch
```

## 2.4 Verify Elasticsearch

```bash
curl http://localhost:9200
```

From external machine (optional test):

```bash
curl http://3.100.10.10:9200
```

# 3. Install and Configure Logstash

## 3.1 Install Logstash

```bash
sudo apt install logstash -y
```
## 3.2 Create Logstash Pipeline

```bash
sudo nano /etc/logstash/conf.d/logstash.conf
```

Add:

```conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [message] {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:log_timestamp} %{LOGLEVEL:log_level} %{GREEDYDATA:log_message}"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["http://localhost:9200"]
    index => "python-logs-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
```

## 3.3 Test Logstash Configuration

```bash
sudo /usr/share/logstash/bin/logstash --path.settings /etc/logstash -t
```

## 3.4 Start and Enable Logstash

```bash
sudo systemctl start logstash
sudo systemctl enable logstash
sudo systemctl status logstash
```

## 3.5 Open Port 5044 (If UFW Enabled)

```bash
sudo ufw allow 5044/tcp
```


# 4. Install and Configure Kibana

## 4.1 Install Kibana

```bash
sudo apt install kibana -y
```

## 4.2 Configure Kibana

```bash
sudo nano /etc/kibana/kibana.yml
```

Modify:

```yaml
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://localhost:9200"]
```

## 4.3 Start and Enable Kibana

```bash
sudo systemctl start kibana
sudo systemctl enable kibana
sudo systemctl status kibana
```

## 4.4 Open Kibana Port

```bash
sudo ufw allow 5601/tcp
```

## 4.5 Access Kibana

Open in browser:

```
http://3.100.10.10:5601
```

# 5. APPLICATION SERVER SETUP (Filebeat)

Run on Python Application Server (3.101.20.20)


## 5.1 Add Elastic Repository

```bash
sudo apt update -y
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | \
sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt update -y
```

## 5.2 Install Filebeat

```bash
sudo apt install filebeat -y
```

## 5.3 Configure Filebeat

```bash
sudo nano /etc/filebeat/filebeat.yml
```

Modify:

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/python-app/app.log

output.logstash:
  hosts: ["172.31.10.10:5044"]
```

Important:

Use ELK Server Private IP (172.31.10.10) for better security inside VPC.


## 5.4 Test Filebeat Connection

```bash
sudo filebeat test output
```

## 5.5 Start and Enable Filebeat

```bash
sudo systemctl start filebeat
sudo systemctl enable filebeat
sudo systemctl status filebeat
```

# 6. Verification

## Check Elasticsearch Indices

Run on ELK server:

```bash
curl http://localhost:9200/_cat/indices?v
```

You should see:

```
python-logs-YYYY.MM.dd
```

## Check Logstash Listening Port

```bash
sudo ss -plnt | grep 5044
```

## Check Kibana Port

```bash
sudo ss -plnt | grep 5601
```

# Required Configuration Files

Elasticsearch
`/etc/elasticsearch/elasticsearch.yml`

Logstash
`/etc/logstash/conf.d/logstash.conf`

Kibana
`/etc/kibana/kibana.yml`

Filebeat
`/etc/filebeat/filebeat.yml`

