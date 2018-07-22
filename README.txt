Theseus
Path-based testing decomplected.

Path-based because Theseus creates paths through your app for you.

Decomplected because instead of having a large set of automated integration tests where each test navigates through your system to a specific place, does some stuff, and verifies some state along the way; you keep your assertions, data, states, how to navigate, how to do domain actions, etc all seperate and Theseus combines them for you.



To use
First you create a collection of facts about your system that describe how to use your applciation as well as how you expect it to work. 

Navigation
BeforeEntering
BeforeLeaving
AfterEntering
AfterLeaving
