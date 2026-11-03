# Owner photo publishing

The existing owner photo key is configured in Netlify Functions scope for production and deploy previews. It is not a user-account system; only the owner with the private editor key can publish. A Windows DPAPI-encrypted copy is held outside the repository at `%LOCALAPPDATA%/LightningMcGreenLiving/owner-photo-key.xml`. Windows packaged-app file redirection may place it under the Codex package’s LocalCache/Local folder. The helper checks both the normal location and that existing package location; an explicit encrypted XML path can be supplied with `-KeyFile`. Only the same Windows user on this computer can decrypt it. Never upload that file or paste its decrypted value into chats, source, screenshots or public issues.

## Publish without displaying or copying the key

Run PowerShell 7 from this repository:

```powershell
./scripts/owner-photo-upload.ps1 -File 'C:/Photos/permitted-photo.jpg' -TargetId 'az-phoenix' -Alt 'A descriptive, factual description' -Credit 'Photographer and license' -Caption 'Identify city context or the exact property accurately' -SourceUrl 'https://publisher.example/original' -Rights licensed -ConfirmRights -ConfirmPublic
```

Replace the example with an image you own or have a verified license/permission to publish. The helper reads the encrypted local key internally and never prints it. Its confirmations affirm public publication and image rights. It prints an operation UUID before sending: reuse the same `-UploadId` if the response is uncertain, after checking the gallery. Do not generate a new ID for an uncertain retry. `-Site` permits only this project's production origin and numbered deploy-preview origins.

Use the searchable `/admin/photos` destination selector to find one of the298 canonical city, workbook, rental or property-directory targets and its exact ID. The UI can accept an owner key manually; it keeps it only in page memory. The helper provides access without exposing the key on screen.

The browser editor re-encodes uploaded images to remove embedded metadata. This command-line helper sends original bytes: inspect/remove private EXIF or identifying information before publishing. Images are public, under4MB, and limited to JPEG/PNG/WebP. Captions, alt text, credit and source URLs are also public. Do not publish private documents, identifiable resident details, copyrighted marketing photographs without permission, or a city image labeled as a property/unit image.

Production and each preview use separate stores. A preview publication is not production evidence. No photo withdrawal UI is implemented; the owner can remove the corresponding record and image in Netlify Blobs if needed. Keep receipts to identify them. Source-only galleries remain useful when no permitted image is available.

For key recovery/rotation, use the account's Netlify environment settings. Update the encrypted local copy securely, then redeploy to activate changed function environment. Do not rotate merely to troubleshoot a failed upload; check status, origin, target and deployment first.
