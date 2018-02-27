# shirtigo-api-python
A python implementation of a client for the shirtigo print API.
Check out our [REST-API documentation](https://cockpit.shirtigo.de/docs/rest-api/) for a full list of all features.

# Basic usage
## Client object initialization
```
    const { ApiClient } = require("./client.js")

    const BASE_URL = "https://testing.cockpit.shirtigo.de/api/"
    const API_TOKEN = "YOUR_API_TOKEN"
    let client = new ApiClient(API_TOKEN, BASE_URL)
```
## Access your shirtigo user data
```
    client.get("user").then((data) => {
        console.log(data["firstname"], data["lastname"])
    })
```

## Create a project
```
    let data = {"name" : "My test project " + random_string() }
    client.post("projects", data).then((project) => {
        console.log(project)
    })
```

## Uploading a design
 The product creation reqires to upload a design first.
### From file:
```
    const fs = require("fs")

    design_path = "./test_design.png"
    client.post("designs/file", {}, {}, {
        "file": fs.createReadStream(design_path),
    }).then((design) => {
        console.log(design)
    })
```
### From URL:
```
    let data = {"url" : "https:/my-web-storage/my-design.png"}
    design = client.post("designs/url", data).then((design) => {
        console.log(design)
    })
```

## Get a list of your existing designs
```
    client.get("designs").then((response) => {
        let designs = response.data
        console.log(designs)
    })
```

## Add a processing area to a project
```
    let data = {
          "area": "front",
          "position": "center",
          "method": "print",
          "design": design["reference"],
          "offset_top": 300,
          "offset_center": 10,
          "width": 200,
    }
    client.post("projects/" + project["reference"] + "/processings", data)
```

## Get a list of available base products to process (print)
```
    client.get("base-products").then((response) => {
        let base_products = response.data
        console.log(base_products)
    })
```

we select the last one for our test
```
  let base_product = base_products[base_products.length - 1]
  let colors = base_product["colors"]["data"].map(c => c["id"])
  let test_sizes = base_product["colors"]["data"].map(c => c["sizes"][0]["id"])
```

## Create a product
Product creation combines a base product, and a project.
Let's create a product with our design on the shirt front
```
    let data = {
        "project_id": project["reference"],
        "base_product_id": base_product["id"],
        "colors": colors
    }
    client.post("products", data).then((product) => {
        console.log(product)
    })
```

## Publish finished project
 Finished projects need to be published before products can be ordered from a project
```
    client.post("projects/" + project["reference"] + "/publish")
```

## Order a list of products
```
    let cart = colors.map((color, index) => {
        return {
            "productId": product["id"],
            "colorId": color,
            "sizeId": test_sizes[index],
            "amount": 1,
        }
    })

    let order_data = {
        "delivery": {
            "title": "Dr.",
            "company": "Shirtigo GmbH",
            "firstname": "Max",
            "lastname": "Mustermann",
            "street": "Musterstraße 12",
            "postcode": "12345",
            "city": "Köln",
            "country": "Deutschland"
        },
        "sender": {
            "title": "Dr.",
            "company": "Shirtigo GmbH",
            "firstname": "Max",
            "lastname": "Mustermann",
            "street": "Musterstraße 12",
            "postcode": "12345",
            "city": "Köln",
            "country": "Deutschland"
        },
        "products": cart
    }
```
## Check the current price for a planned order
```
    client.post("orders/predict-price", order_data).then((prices) => {
        console.log(prices)
    })
```
## Post order request
```
    order = client.post("orders", order_data).then((order) => {
        console.log(order)
    })
```
