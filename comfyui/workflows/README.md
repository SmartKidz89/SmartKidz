# ComfyUI workflow templates

This repo calls ComfyUI's HTTP API (typical endpoints: `/prompt`, `/history/{prompt_id}`, `/view`) and
loads a workflow template JSON from this folder, then replaces placeholders like:

- `{{prompt}}`
- `{{negative_prompt}}`
- `{{width}}`, `{{height}}`
- `{{steps}}`, `{{cfg_scale}}`
- `{{sampler}}`, `{{scheduler}}`

## How to create a template
1. In ComfyUI, build a workflow and ensure it produces an image.
2. Export it as JSON.
3. Replace the text fields you want to be dynamic with placeholders above (e.g. the CLIPTextEncode prompt node).
4. Save as `<workflow_name>.json` in this folder.
5. In the Lesson Jobs sheet, set `comfyui_workflow` to `<workflow_name>` (without `.json`).

A minimal example template is provided as `basic_text2img.json`, but you will typically replace it with your own.
