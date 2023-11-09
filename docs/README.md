# docs

## deploy environments

### OP
> what is the recommended setup for dev / staging / prod deployments for partykit server deploy (using npx partykit deploy)? do i need to somehow make a separate app for each?

### jevakallio
> you can deploy with a `--preview` flag, e.g.

```sh
npx partykit deploy --preview staging
```

This would deploy to `staging.project.username.partykit.dev`.

You can also create ephemeral preview environments for e.g. each branch or pull request in your CI environment, but it takes 1-2 minutes to provision new subdomains, so there will be a short delay before the branch environment is available

