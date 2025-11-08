---
title: "Getting rid of Json Recursion"
date: 2025-09-23 00:42:00 +0600
categories: [software-security, backend, java]
tags: [json, secure-code, spring-boot]
---

# Ever Fall into Infinite Recursion?

I have!

During a project, I was referencing **`UrlEntity`** and **`ClickHistory`** entity through a **bidirectional relation** without caring about the Jackson serialization process. And while testing it, I saw that Jackson keeps serializing back and forth forever — and it caused **infinite recursion**!

---

## How Jackson Works?

You write your POJO obviously for a reason — to convert it to a JSON object!
This conversion is called **serialization**, and when you convert JSON back into a Java object, that’s **deserialization** .

Here comes **Jackson** — a Java library that handles serialization and deserialization .

But there are some critical points:

When Jackson serializes objects, it follows all fields recursively until:

1. All fields are visited, or
2. It finds a break (`null`)

Think of them like base cases in recursion.

---

## What Happened in My Case

```java
@Entity
public class Url {
    @OneToMany(mappedBy = "url")
    private List<ClickHistory> clicks;
}

@Entity
public class ClickHistory {
    @ManyToOne
    private Url url;
}
```

I had a **bidirectional relation**.
In this case, think `Url` as a **parent class** and `ClickHistory` as a **child class**.

* Jackson started serializing objects from the parent class (`Url`).
* It saw the relation with the child class and went there.
* While serializing the child (`ClickHistory`), it found a relation back to the parent (`Url`).
* Then it started serializing the parent again... and again...

That caused an **infinite loop**, or you could say **infinite recursion**!

This kind of thing often happens while creating relations among different entities.

---

## Mitigating Infinite Recursion Problem

Normally, I use **`@JsonManagedReference`** and **`@JsonBackReference`** annotations.

### What do they mean?

* If you use `@JsonManagedReference` on the **parent class**, Jackson will serialize it normally.
* Then it goes to the child class as referenced.
* When it finds the parent field again with a `@JsonBackReference`, it will tell Jackson:
    “Don’t serialize this — it’s already being handled on the parent side.”

### Example

```java
@Entity
public class Url {
    @OneToMany(mappedBy = "url")
    @JsonManagedReference
    private List<ClickHistory> clicks;
}

@Entity
public class ClickHistory {
    @ManyToOne
    @JsonBackReference
    private Url url;
}
```

---

### What Happens Now

* JSON for **Url** will include `clicks`.
* JSON for **ClickHistory** will **not include** the `url` field.
* The infinite loop is **gone**! 


