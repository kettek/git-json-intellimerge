# git-json-intellimerge
**DISCLAIMER**: Use at your own risk. This merge driver has not *yet* been thoroughly tested, although usage is ongoing.

This is a 3-way merge driver for JSON files. It analyzes the local and incoming versions of a file in relation to the base version of the file. If all changes from both can be applied, their shared diffs are applied and the merge is considered complete. If a conflict is found, then the merger bails and, if the provided configuration here is used, git's diff3-based merge driver will be used for final resolution and must be manually merged.

Using git's diff3 merger has potential for failure if the changes are substantial enough, so caution is advised. If all merging of conflicts are to be avoided, even if manually verified, then adjust the `.gitconfig` section to not fall back to `git merge-file`.

## Installation

First install git-json-intellimerge globally.

```
npm i git-json-intellimerge --global
```

Then add or edit the `.gitattributes` file in your project root:

```
*.json merge=json
```

Now add or edit your `.gitconfig` file in your project root:

```
[merge "json"]
  name = JSON intelligent merge
  driver = git-json-intellimerge %O %A %B || git merge-file -L "current" -L "base" -L "incoming" --marker-size=%L %A %O %B
  conflictstyle = diff3
```

Commit the .gitattributes and .gitconfig files.

For the .gitconfig attributes to be useable during a merge, you must set your private `.git/config` file to include the repo's `.gitconfig`. So, **in the project root**, issue the following command:

```
git config --local include.path ../.gitconfig
```

Alternatively, you can put the above `.gitconfig` contents at the end of your `.git/config` file instead of running the above command.

## Local Installation
Follow much of the above instructions but install git-json-intellimerge somewhere local (or even in a node_modules/ dir) and adjust the `.gitconfig` merge section to reflect the proper location of the script.

## Caveats

On Windows 10, you may receive a message similar to the following: **...cannot be loaded because running scripts is disabled on this system. ...**

The solution is to run the following command in the Administrator command-line:

```
Set-ExecutionPolicy RemoteSigned 
```

Please note that this does allow your PowerShell system to run unsigned local scripts, so take precaution as necessary.
