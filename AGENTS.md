- Keep things simple, only change what is necessary to make the request work well, but keep the code organized in different files and functions to make it easy to maintain
  Code Style — Comments explain why, not just what. Imports grouped. Names that actually mean something.
  Data Access — Always through a DAO tier.
  Error Handling — Fail loud where it matters, dead code is better than limping code, validate inputs, don’t let async errors disappear.
  Implement error handling in functions, and deal with the errors in the ui.
- When you change something that is a big change, write it in the README, so its easier to check where everything is, no need to explain what changed, only organize the file writting where the functions, components and pages are.
