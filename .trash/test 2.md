---
tag: todo
State: todo
Difficulty: 0
Category: (relative = false) => {
      let vault_path = "";
      if (import_obsidian8.Platform.isMobileApp) {
        const vault_adapter = app.vault.adapter.fs.uri;
        const vault_base = app.vault.adapter.basePath;
        vault_path = `${vault_adapter}/${vault_base}`;
      } else {
        if (app.vault.adapter instanceof import_obsidian8.FileSystemAdapter) {
          vault_path = app.vault.adapter.getBasePath();
        } else {
          throw new TemplaterError("app.vault is not a FileSystemAdapter instance");
        }
      }
      if (relative) {
        return this.config.target_file.path;
      } else {
        return `${vault_path}/${this.config.target_file.path}`;
      }
    }
Sub Category: null
Start date: ""
End date: ""
Creation date: 2023-09-08 20:21
Resources: []
Changes: []
Git commit: ""
Version: 0
sticker: vault//Bins/icons/candy-icons/apps/scalable/thedarkmod.svg
---

## **feature specification** 
*short description of the feature*

### *what is the purpose of the feature?*


### *what is the scope of the feature?*


### *what are the design considerations for the feature?*


### *Product acceptance criteria:*


### *User stories:*


## **current state** 


## **sub tasks**
 - [ ] write the feature specs down
 - [ ] explain the current state


## **feature design**
*the design process and final result of the feature design, should include as many diagrams as it can*

### **Preliminary Research**
***before I can come up with a solution for a design I need to understand the world of the problem,
this is the place to get all the info I need in order to start***
#### *background on the feature?*
##### *available solutions?*
##### *existing implementations?*

#### *where can the feature go?*

#### *my ten minute of breaking my head against the web but now on paper*

#### *list of assumptions and hypothesis*
*this is very important section, here I should write what I assume I know in and need and what I think I know and need.*
#### *what I still don't know. aka "unknown unknowns"*




### **design process**
![[research notes /vim/features/Untitled Diagram.svg]]

### **final design**



## **feature implementation**
*the implementation details of the feature should include as descriptive of explanation as possible and include screen shots and links as needed *


### *implementation process*


### *final implementation*


## **testing**
*the tests the feature passed and didn't pass*

## **future**
*notes for future self, possible changes that can or should be made, tool used, struggle points and every thing that might be relevant in order to maintain the feature*
### *tools used*


### *struggle points*


### *possible additions or changes that might need to be made*



## **reflection**
*what did I do well? what could have been better? interesting things I have learned?*


## **resources used**
*a list of all the resources I used and why I used them, this note should not contain any research or info that is not related to the new feature thous should be extracted to wiki note*

