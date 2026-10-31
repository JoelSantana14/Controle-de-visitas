import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  Lead, 
  BrokerItem, 
  DevelopmentItem, 
  OriginItem, 
  TeamItem, 
  TaskItem,
  DistributionRule,
  DistributionSettings,
  DistributionLog,
  INITIAL_DISTRIBUTION_RULES,
  INITIAL_DISTRIBUTION_SETTINGS,
  INITIAL_DISTRIBUTION_LOGS
} from '../types';
import { INITIAL_LEADS } from '../mockData';
import { INITIAL_BROKER_ITEMS, INITIAL_DEVELOPMENT_ITEMS, INITIAL_ORIGIN_ITEMS, INITIAL_TEAM_ITEMS, INITIAL_TASKS } from '../types';

// Error handler conforming to FirestoreErrorInfo requirement
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Seed initial data if collections are empty
export async function seedInitialDataIfNeeded() {
  try {
    const leadsSnap = await getDocs(collection(db, 'leads'));
    if (leadsSnap.empty) {
      for (const lead of INITIAL_LEADS) {
        await setDoc(doc(db, 'leads', lead.id), lead);
      }
    }
    const brokersSnap = await getDocs(collection(db, 'brokers'));
    if (brokersSnap.empty) {
      for (const b of INITIAL_BROKER_ITEMS) {
        await setDoc(doc(db, 'brokers', b.id), b);
      }
    }
    const devsSnap = await getDocs(collection(db, 'developments'));
    if (devsSnap.empty) {
      for (const d of INITIAL_DEVELOPMENT_ITEMS) {
        await setDoc(doc(db, 'developments', d.id), d);
      }
    }
    const originsSnap = await getDocs(collection(db, 'origins'));
    if (originsSnap.empty) {
      for (const o of INITIAL_ORIGIN_ITEMS) {
        await setDoc(doc(db, 'origins', o.id), o);
      }
    }
    const teamsSnap = await getDocs(collection(db, 'teams'));
    if (teamsSnap.empty) {
      for (const t of INITIAL_TEAM_ITEMS) {
        await setDoc(doc(db, 'teams', t.id), t);
      }
    }
    const tasksSnap = await getDocs(collection(db, 'tasks'));
    if (tasksSnap.empty) {
      for (const task of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', task.id), task);
      }
    }
    const rulesSnap = await getDocs(collection(db, 'distribution_rules'));
    if (rulesSnap.empty) {
      for (const rule of INITIAL_DISTRIBUTION_RULES) {
        await setDoc(doc(db, 'distribution_rules', rule.id), rule);
      }
    }
    const settingsSnap = await getDocs(collection(db, 'distribution_settings'));
    if (settingsSnap.empty) {
      await setDoc(doc(db, 'distribution_settings', 'global_settings'), INITIAL_DISTRIBUTION_SETTINGS);
    }
    const logsSnap = await getDocs(collection(db, 'distribution_logs'));
    if (logsSnap.empty) {
      for (const log of INITIAL_DISTRIBUTION_LOGS) {
        await setDoc(doc(db, 'distribution_logs', log.id), log);
      }
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

// Firestore Realtime Service Operations
export const firestoreService = {
  // Auth helpers
  loginWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Subscriptions (Real-time onSnapshot)
  subscribeLeads(callback: (leads: Lead[]) => void, onError?: (err: any) => void) {
    const path = 'leads';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: Lead[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as Lead);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  subscribeBrokers(callback: (brokers: BrokerItem[]) => void, onError?: (err: any) => void) {
    const path = 'brokers';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: BrokerItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as BrokerItem);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  subscribeDevelopments(callback: (devs: DevelopmentItem[]) => void, onError?: (err: any) => void) {
    const path = 'developments';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: DevelopmentItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as DevelopmentItem);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  subscribeOrigins(callback: (origins: OriginItem[]) => void, onError?: (err: any) => void) {
    const path = 'origins';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: OriginItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as OriginItem);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  subscribeTeams(callback: (teams: TeamItem[]) => void, onError?: (err: any) => void) {
    const path = 'teams';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: TeamItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as TeamItem);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  subscribeTasks(callback: (tasks: TaskItem[]) => void, onError?: (err: any) => void) {
    const path = 'tasks';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: TaskItem[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as TaskItem);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  // Mutations
  saveLead: async (lead: Lead) => {
    const path = `leads/${lead.id}`;
    try {
      await setDoc(doc(db, 'leads', lead.id), lead);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteLead: async (leadId: string) => {
    const path = `leads/${leadId}`;
    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveBroker: async (broker: BrokerItem) => {
    const path = `brokers/${broker.id}`;
    try {
      await setDoc(doc(db, 'brokers', broker.id), broker);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteBroker: async (brokerId: string) => {
    const path = `brokers/${brokerId}`;
    try {
      await deleteDoc(doc(db, 'brokers', brokerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveDevelopment: async (dev: DevelopmentItem) => {
    const path = `developments/${dev.id}`;
    try {
      await setDoc(doc(db, 'developments', dev.id), dev);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteDevelopment: async (devId: string) => {
    const path = `developments/${devId}`;
    try {
      await deleteDoc(doc(db, 'developments', devId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveOrigin: async (origin: OriginItem) => {
    const path = `origins/${origin.id}`;
    try {
      await setDoc(doc(db, 'origins', origin.id), origin);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteOrigin: async (originId: string) => {
    const path = `origins/${originId}`;
    try {
      await deleteDoc(doc(db, 'origins', originId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveTeam: async (team: TeamItem) => {
    const path = `teams/${team.id}`;
    try {
      await setDoc(doc(db, 'teams', team.id), team);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteTeam: async (teamId: string) => {
    const path = `teams/${teamId}`;
    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  saveTask: async (task: TaskItem) => {
    const path = `tasks/${task.id}`;
    try {
      await setDoc(doc(db, 'tasks', task.id), task);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
  deleteTask: async (taskId: string) => {
    const path = `tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Users management
  subscribeUsers(callback: (users: import('../types').AppUser[]) => void, onError?: (err: any) => void) {
    const path = 'users';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: import('../types').AppUser[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as import('../types').AppUser);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  saveUser: async (user: import('../types').AppUser) => {
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteUser: async (userId: string) => {
    const path = `users/${userId}`;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Distribution Rules
  subscribeDistributionRules(callback: (rules: DistributionRule[]) => void, onError?: (err: any) => void) {
    const path = 'distribution_rules';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: DistributionRule[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as DistributionRule);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  saveDistributionRule: async (rule: DistributionRule) => {
    const path = `distribution_rules/${rule.id}`;
    try {
      await setDoc(doc(db, 'distribution_rules', rule.id), rule);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteDistributionRule: async (ruleId: string) => {
    const path = `distribution_rules/${ruleId}`;
    try {
      await deleteDoc(doc(db, 'distribution_rules', ruleId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Distribution Settings
  subscribeDistributionSettings(callback: (settings: DistributionSettings) => void, onError?: (err: any) => void) {
    const path = 'distribution_settings/global_settings';
    return onSnapshot(doc(db, 'distribution_settings', 'global_settings'), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as DistributionSettings);
      } else {
        callback(INITIAL_DISTRIBUTION_SETTINGS);
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  saveDistributionSettings: async (settings: DistributionSettings) => {
    const path = 'distribution_settings/global_settings';
    try {
      await setDoc(doc(db, 'distribution_settings', 'global_settings'), settings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Distribution Logs
  subscribeDistributionLogs(callback: (logs: DistributionLog[]) => void, onError?: (err: any) => void) {
    const path = 'distribution_logs';
    return onSnapshot(collection(db, path), (snapshot) => {
      const items: DistributionLog[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as DistributionLog);
      });
      callback(items);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        if (onError) onError(e);
      }
    });
  },

  saveDistributionLog: async (log: DistributionLog) => {
    const path = `distribution_logs/${log.id}`;
    try {
      await setDoc(doc(db, 'distribution_logs', log.id), log);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
