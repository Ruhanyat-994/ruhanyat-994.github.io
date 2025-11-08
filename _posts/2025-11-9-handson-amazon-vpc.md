---
title: "Hands-On Amazon VPC!"
date: 2025-11-09 03:31:00 +0600
categories: [Cloud_Native,AWS]
tags: [Cloud, DevOps, AWS, VPC]
---

# Amazon Virtual Private Cloud (VPC)

VPC enables you to launch AWS resources in a logically `isolated virtual network` that you define.

![VPC Architecture](../assets/Images/vpc-image-1.png)


## **Availability Zones (AZs)**

- Each AZ acts as an isolated data center location within a region, improving fault tolerance and redundancy.
1. **Availability Zone A**

   * Contains:

     * **Public Subnet (10.0.1.0/24)**
     * **Private Subnet (10.0.2.0/24)**

2. **Availability Zone B**

   * Contains:

     * **Public Subnet (10.0.3.0/24)**
     * **Private Subnet (10.0.4.0/24)**

---

## **Public Subnets**

* **Public Subnets** are labeled:

  * AZ A → `10.0.1.0/24`
  * AZ B → `10.0.3.0/24`

These have direct routes to internet Gateway.

---

## **Private Subnets**

* **Private Subnets** are labeled:

  * AZ A → `10.0.2.0/24`
  * AZ B → `10.0.4.0/24`

These subnets are **isolated from the internet** — they don’t connect directly to the Internet Gateway.
Instead, outbound internet traffic from private instances is routed through a **NAT Gateway** located in a public subnet.

---

## **NAT Gateway**

* It enables instances in private subnets to access the internet for downloading, packaging and updating.

* The diagram shows arrows from:

  * The **Private Subnet (10.0.4.0/24)** in AZ B
  * The **Private Subnet (10.0.2.0/24)** in AZ A
    Both connecting to the **NAT Gateway**, which in turn routes traffic to the **Internet Gateway**.

---

##  **Route Tables**

* There is a **Route Tables** box, representing network routing configurations.

  * **Public Subnet Route Table:** Routes 0.0.0.0/0 traffic to the Internet Gateway.
  * **Private Subnet Route Table:** Routes 0.0.0.0/0 traffic to the NAT Gateway.

---

## **Security Layers**

1. **Security Groups (SGs)**

   * Function at the **instance level**.
   * Control inbound and outbound traffic for EC2 instances.
   * Typically allow HTTP/HTTPS/SSH for public instances and restricted access for private ones.

2. **Network ACLs (NACLs)**

   * Function at the **subnet level**.
   * Provide an additional layer of security that can allow or deny specific IP ranges.
   * Usually stateless, meaning inbound and outbound rules are separate.

---

# Interview Dose
---
#### VPC Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| **Subnets** | Logical subdivision of VPC | Separate public/private resources |
| **Internet Gateway** | Gateway to the internet | Enable internet access |
| **NAT Gateway** | Network Address Translation | Outbound internet for private subnets |
| **Route Tables** | Traffic routing rules | Control network traffic flow |
| **Security Groups** | Instance-level firewall | Stateful traffic filtering |
| **NACLs** | Subnet-level firewall | Stateless traffic filtering |
