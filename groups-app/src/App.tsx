import React, { useState, useEffect } from 'react';
import './App.css';
import groupsData from './groups.json';


interface User {
  first_name: string;
  last_name: string;
}

interface Group {
  id: number;
  name: string;
  closed: boolean;
  avatar_color?: string;
  members_count: number;
  friends?: User[];
}

interface GetGroupsResponse {
  result: 1 | 0;
  data?: Group[];
}

const backendDelay = 1000; // Задержка на эмуляцию работы с бэкендом

// Эмуляция ответа от бэкенда
const getGroupsFromBackend = (): Promise<GetGroupsResponse> => { 
  return new Promise<GetGroupsResponse>((resolve, reject) => {
    setTimeout(() => {
      const response: GetGroupsResponse = {
        result: 1,
        data: groupsData
      };
      resolve(response);
    }, backendDelay);
  });
};


interface FilterProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ options, selected, onSelect }) => {
  return (
    <select value={selected} onChange={(e) => onSelect(e.target.value)}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const App: React.FC = () => { 
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyFilter, setPrivacyFilter] = useState<string>('All');
  const [colorFilter, setColorFilter] = useState<string>('Any');
  const [friendsFilter, setFriendsFilter] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getGroupsFromBackend()
      .then(response => {
        setLoading(false);
        if (response.result === 1 && response.data) {
          setGroups(response.data);
        } else {
          setError('Failed to fetch groups.');
        }
      })
      .catch(error => {
        setLoading(false);
        setError('Failed to fetch groups.');
      });
  }, []);

  const filteredGroups = groups.filter(group => {
    if (privacyFilter === 'All' || (privacyFilter === 'Closed' && group.closed) || (privacyFilter === 'Open' && !group.closed)) {
      if (colorFilter === 'Any' || group.avatar_color === colorFilter) {
        if (!friendsFilter || (friendsFilter && group.friends && group.friends.length > 0)) {
          return true;
        }
      }
    }
    return false;
  });

  return (
    <div className="App">
      <h1>Groups</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <>
          <div>
            <label>Privacy Filter:</label>
            <Filter
              options={['All', 'Open', 'Closed']}
              selected={privacyFilter}
              onSelect={setPrivacyFilter}
            />
          </div>
          <div>
            <label>Color Filter:</label>
            <Filter
              options={['Any', '#ff0000', '#00ff00', '#0000ff']} 
              selected={colorFilter}
              onSelect={setColorFilter}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={friendsFilter}
                onChange={(e) => setFriendsFilter(e.target.checked)}
              />{' '}
              Filter by Friends
            </label>
          </div>
          <div className="group-list">
            {filteredGroups.map(group => (
              <div key={group.id} className="group">
                <h2>{group.name}</h2>
                {group.avatar_color && (
                  <div
                    className="avatar"
                    style={{
                      backgroundColor: group.avatar_color,
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%'
                    }}
                  />
                )}
                <p>{group.closed ? 'Closed' : 'Open'}</p>
                <p>{group.members_count} members</p>
                {group.friends && group.friends.length > 0 && (
                  <>
                    <p>{group.friends.length} friends</p>
                    <div className="friends-list">
                      {group.friends.map((friend, index) => (
                        <p key={index}>{`${friend.first_name} ${friend.last_name}`}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
