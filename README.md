![6B31465F-F7EA-40D2-9398-160851BEF56B](https://user-images.githubusercontent.com/98095245/219832584-59e30683-e441-4a8b-969a-fcdf828694b7.jpeg)


# obsidian-scriptable-tasks-widget
This is javascript code to display my tasks from obsidian in an iPad OS extra large widget using [Scriptable](https://scriptable.app)

There are a few steps to set up. First you need to designate a bookmarked path in the scriptable app. Then you can change the required variables in the script and it should basically work

That is assuming your daily notes are sorter into DailyNotes/Years/Months/dailynote.md format. If they aren't you might need to do some editing of the file finder function.

It is annoying having to launch the scriptable app each time a link is clicked, however I think this is just a limitation of how ios handles uri links.

This is my first Javascript project so I am sure there are lots of technical issue with it, however it runs and it works for what I need

Also, apparently there may be some issues if there are too many daily notes, however I have not run into this issue

Feel free to edit this, improve upon it, I'm not quite sure how github works but if you can submit improvements to here that would be appreciated.

For making smaller widgets you can hackily change the for loop in the create widget function to only output say Two Task lists (overdue, today) an then that should run fine in a Large widget.

Again it's not the prettiest and best solution probably, but its the best ive seen and can use.

https://user-images.githubusercontent.com/98095245/219821917-571706e8-6c07-4f1b-ae00-65c5141ef11b.MOV
