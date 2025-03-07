export default {
    "status": "Success",
    "consignmentId": "00111AB",
    "articles": [
        {
            "articleId": "00111AB",
            "status": {
                "statusAttributeName": "Delivery Status of Article",
                "statusAttributeValue": "Delivered",
                "statusModificationDateTime": 1623809605000
            },
            "atlStatus": null,
            "trackStatusOfArticle": "Delivered",
            "statusColour": "#00ac3e",
            "nickname": null,
            "articleRedirect": false,
            "userOwnership": false,
            "atlEligible": false,
            "redirectIneligibility": {
                "code": "4",
                "reason": "Too late (article has had a disabling event code)"
            },
            "safeDropIneligibility": {
                "code": "1",
                "reason": "Article will be left in a safe place"
            },
            "awaitingCollectionWorkCentreId": null,
            "awaitingCollectionDeliveryPointId": null,
            "atlLocation": null,
            "atlLocationCode": null,
            "merchantId": "N/A",
            "barcode": "00900000000000980000000000000200000000000|0000000|0000000000|1234567891021",
            "details": [
                {
                    "articleId": "00111AB",
                    "consignmentId": "00111",
                    "articleType": "Parcel Post",
                    "productSubType": "Parcel Post Own Packaging Under 5kg",
                    "sender": null,
                    "address": {
                        "addressee": null,
                        "addressLine1": null,
                        "addressLine2": null,
                        "addressLine3": null,
                        "suburb": null,
                        "state": null,
                        "postCode": null,
                        "country": "AU",
                        "countryName": null,
                        "deliveryPointId": null,
                        "addressType": null,
                        "articleAddressType": "POSTAL",
                        "internationalAddress": false,
                        "postalAddress": true,
                        "customerPickupAddress": false,
                        "email": null,
                        "mobile": null,
                        "phone": null
                    },
                    "fromAddress": {
                        "addressee": null,
                        "addressLine1": null,
                        "addressLine2": null,
                        "addressLine3": null,
                        "suburb": null,
                        "state": null,
                        "postCode": null,
                        "country": "AU",
                        "countryName": null,
                        "deliveryPointId": null,
                        "addressType": null,
                        "articleAddressType": "POSTAL",
                        "internationalAddress": false,
                        "postalAddress": true,
                        "customerPickupAddress": false,
                        "email": null,
                        "mobile": null,
                        "phone": null
                    },
                    "previousDelivery": null,
                    "accessCode": null,
                    "deliverySummary": {
                        "imageExists": false
                    },
                    "deliveredByDate": null,
                    "deliveredByDateISO": null,
                    "estimatedDeliveryDateRange": null,
                    "collectByDateISO": null,
                    "dateRevised": true,
                    "displaySubscriptionPrompt": false,
                    "redirectStatus": null,
                    "displayEstimatorLink": false,
                    "extendedDescription": null,
                    "toolTipText": null,
                    "events": [
                        {
                            "dateTime": 1623809604000,
                            "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                            "description": "Delivered",
                            "location": "PINE GAP",
                            "eventCode": "DD-ER13",
                            "wcid": "000999"
                        },
                        {
                            "dateTime": 1623722435000,
                            "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                            "description": "Received by Australia Post",
                            "location": "NEWTOWN NSW",
                            "eventCode": "AFC-ER31",
                            "wcid": "000124"
                        },
                        {
                            "dateTime": 1623474780000,
                            "localeDateTime": "YYYY-MM-DDTHH:mm:SS+10:00",
                            "description": "Shipping information received by Australia Post",
                            "location": null,
                            "eventCode": "ADMIN-ER39",
                            "wcid": "000123"
                        }
                    ],
                    "milestones": [
                        {
                            "name": "Delivered",
                            "description": null,
                            "colour": "#00ac3e",
                            "status": "Current",
                            "progressPercentage": 100,
                            "dateTime": "YYYY-MM-DDTHH:mm:SS+10:00"
                        }
                    ],
                    "hasNotification": null,
                    "measurements": null,
                    "internationalTracking": null,
                    "estimatedDeliveryDateEligible": false,
                    "signatureOnDelivery": {
                        "required": false,
                        "instruction": {
                            "code": "SIG_NO",
                            "description": null
                        }
                    },
                    "collectionInstruction": {
                        "delegate": {
                            "allowed": false,
                            "reason": "article must be awaiting collection at either PARCEL_COLLECT or WORK_CENTRE"
                        },
                        "facility": null
                    }
                }
            ]
        }
    ]
}