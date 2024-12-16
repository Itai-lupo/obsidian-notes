---
created: <% tp.file.creation_date() %>
tags:
  - Daily_Notes
banner: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJq2q3DMJYoMnyygnbhIHdSc5OYDFP4QOoHQ&usqp=CAU
sticker: vault//Bins/icons/candy-icons/apps/scalable/preferences-system-time.svg
---
<< [[<% fileDate = moment(tp.file.title, 'MMMM DD, YYYY').subtract(1, 'd').format('MMMM DD, YYYY') %>|Yesterday]] | [[<% fileDate = moment(tp.file.title, 'MMMM DD, YYYY').add(1, 'd').format('MMMM DD, YYYY') %>|Tomorrow]] >>
## <% moment(tp.file.title,'MMMM DD, YYYY').format("dddd, MMMM DD, YYYY") %>

## ✅ daily goals

#### today frog task

- [ ] 

#### today other tasks

- [ ] set goals for today.
- [ ] 
- [ ] 
- [ ]  
- [ ] 
- [ ] complete daily reflection

---
## general notes



---
## 📝Notes
#### *Notes created today*
```dataview
List FROM "" WHERE file.cday = date("{{date:YYYY-MM-DD}}") SORT file.cday asc
```


#### *Notes modified today*
```dataview
List FROM "" WHERE file.mday = date("{{date:YYYY-MM-DD}}") and file.cday != date("{{date:YYYY-MM-DD}}") SORT file.mday asc
```


---
### ***daily reflection***
