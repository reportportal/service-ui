# Attachment component

## Stories

## Description

Component uses the [react-responsive-carousel](https://www.npmjs.com/package/react-responsive-carousel) module. All the gallery part is handled by it.

In our case, the main area is not displayed initially, with a little css it is not a big problem to hide. We could also fork the original repository and introduce a property to toggle that part, but it would be too much trouble.

## Input props

- **attachments**: _array_, required
- **projectId**: _string_, required
- **openImageModal**: _function_
- **openHarModal**: _function_
- **openBinaryModal**: _function_

The component receives `attachments` which is an array of attachments in the following
format:

```
[
    {
        "id": "5b83fa4497a1c00001150f20",
        "src": "...",
        "alt": "application/zip",
        "attachment": {
            "id": "5b83fa4497a1c00001150f20",
            "contentType": "application/zip"
        }
    },
    {
        "id": "5b83fa4497a1c00001150f20",
        "src": "...",
        "alt": "application/zip",
        "attachment": {
            "id": "5b83fa4497a1c00001150f20",
            "contentType": "application/zip"
        }
    }
    ...
]
```
