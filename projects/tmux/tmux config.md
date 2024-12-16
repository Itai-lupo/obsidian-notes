# set true color
set-option -sa terminal-overrides ",xterm*:Tc"

# enavle mouse
set -g mouse on

# start window count from 2 and not 0
set -g base-index 1
set -g pane-base-index 1
set-window-option -g pane-base-index 1
set-option -g renumber-windows on

# Vim style pane selection
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# set prfix key to ctrl + space
unbind C-b
set -g prefix C-Space

# use vi keys
# setw -g mode-keys vi
set-window-option -g mode-keys vi
# keybindings
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi C-v send-keys -X rectangle-toggle
bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel

# open new panes in cwd
bind | split-window -h -c  "#{pane_current_path}"
bind - split-window -v -c  "#{pane_current_path}"


# enable activity alerts
setw -g monitor-activity on
set -g visual-activity on


# shift + alt vim keys to switch windows
bind -n M-H previous-window
bind -n M-L next-window

set -g @catppuccin_flaver 'mocha'

set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'christoomey/vim-tmux-navigator'
set -g @plugin 'dreamsofcode-io/catppuccin-tmux'
set -g @plugin 'tmux-plugins/tmux-yank'

run '/usr/share/tmux-plugin-manager/tpm'