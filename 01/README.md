# Digital Market Hub

## About
Digital Market Hub is an open-source project designed to provide a platform for managing and showcasing various subscription-based services. It includes a user-friendly interface and a structured data format for easy customization.

## Features
- Display subscription services with detailed plans.
- Categorized services for better organization.
- Easy-to-edit data files for customization.

## How to Use
1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/DigitalMarketHub.git
   ```
2. Open the `index.html` file in your browser to view the project.

## How to Edit Data
All data is stored in the `data` folder in JSON format. You can edit the following files to customize the content:

- `products.json`: Contains details about subscription services and their plans.
- `config.json`: Configuration settings for the project.
- `faq.json`: Frequently Asked Questions.
- `notes.json`: Additional notes or information.
- `payment-methods.json`: Payment methods available.

### Steps to Edit
1. Open the desired JSON file in a text editor.
2. Modify the content as needed. For example, to add a new product in `products.json`, follow the existing structure:
   ```json
   {
     "id": "new-product-id",
     "name": "New Product Name",
     "description": "Description of the new product",
     "icon": "icon-class",
     "category": "Category Name",
     "plans": [
       {
         "id": "plan-id1",
         "name": "Plan Name",
         "duration": "Duration",
         "description": "Plan description",
         "currencies": [
           {"currency": "USD", "price": 0.00}
         ]
       },
       {
         "id": "plan-id2",
         "name": "Plan Name",
         "duration": "Duration",
         "description": "Plan description",
         "currencies": [
           {"currency": "USD", "price": 0.00}
         ]
       }
     ]
   }
   ```
3. Save the file and refresh the `index.html` page in your browser to see the changes.

## Hosting and Example Webpage
This project is hosted on GitHub at [Opensource01](https://github.com/mrr00b0t/Opensource01).

You can view the example webpage at [https://mrr00b0t.github.io/01](https://mrr00b0t.github.io/01).

## Contributing
Contributions are welcome! Feel free to fork this repository, make changes, and submit a pull request.

## License
This project is open-source and available under the [MIT License](LICENSE).
